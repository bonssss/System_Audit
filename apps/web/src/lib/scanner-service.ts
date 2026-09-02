import { ProjectScanner, ProjectFileEntry } from '@ai-scanner/scanner-core';
import { ScanProgress, ScanResult } from '@ai-scanner/shared';
import { generateInteractiveHtmlReport, generatePrintablePdfHtml, generateCsvReport, generateJsonReport } from '@ai-scanner/reports';
import { db } from './db';
import { logger } from './logger';
import JSZip from 'jszip';

// In-memory active scan progress tracker for real-time SSE streaming
const activeScanProgress = new Map<string, ScanProgress>();
const scanProgressListeners = new Map<string, Set<(progress: ScanProgress) => void>>();

export function subscribeToScanProgress(scanId: string, listener: (progress: ScanProgress) => void) {
  if (!scanProgressListeners.has(scanId)) {
    scanProgressListeners.set(scanId, new Set());
  }
  scanProgressListeners.get(scanId)?.add(listener);

  // Send current state if available
  const current = activeScanProgress.get(scanId);
  if (current) {
    listener(current);
  }

  return () => {
    scanProgressListeners.get(scanId)?.delete(listener);
  };
}

export function updateScanProgress(progress: ScanProgress) {
  activeScanProgress.set(progress.scanId, progress);
  const listeners = scanProgressListeners.get(progress.scanId);
  if (listeners) {
    for (const listener of listeners) {
      try {
        listener(progress);
      } catch (err) {
        logger.error({ err }, 'Error notifying progress listener');
      }
    }
  }
}

/**
 * Sanitize string for PostgreSQL UTF-8 text columns (removes null byte \0 which causes Postgres error 22021)
 */
function cleanUtf8(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/\0/g, '').replace(/[\u0000]/g, '');
}

const BINARY_EXTENSIONS = /\.(png|jpe?g|gif|ico|webp|woff2?|ttf|eot|otf|mp3|mp4|mov|avi|webm|pdf|zip|tar|gz|7z|rar|exe|dll|so|dylib|bin|iso|dmg|class|jar|pyc|wasm)$/i;

export async function extractZipFiles(buffer: Buffer): Promise<ProjectFileEntry[]> {
  const zip = await JSZip.loadAsync(buffer);
  const files: ProjectFileEntry[] = [];

  const entries = Object.entries(zip.files);
  for (const [rawPath, zipEntry] of entries) {
    if (zipEntry.dir) continue;
    // Normalize path and skip system/junk directories
    const path = rawPath.replace(/\\/g, '/');
    if (
      path.includes('__MACOSX') ||
      path.includes('.git/') ||
      path.includes('node_modules/') ||
      path.includes('.next/') ||
      path.includes('dist/') ||
      path.includes('build/') ||
      BINARY_EXTENSIONS.test(path)
    ) {
      continue;
    }

    try {
      const rawContent = await zipEntry.async('text');
      const content = cleanUtf8(rawContent);
      files.push({
        path,
        content,
        size: content.length,
      });
    } catch {
      // skip unreadable binary files
    }
  }

  return files;
}

export async function executeProjectScan(
  projectId: string,
  files: ProjectFileEntry[],
  existingScanId?: string
): Promise<ScanResult> {
  const scanner = new ProjectScanner();

  // Create or retrieve Scan record in DB
  const scanRecord = existingScanId
    ? await db.scan.update({
        where: { id: existingScanId },
        data: { status: 'RUNNING' },
      })
    : await db.scan.create({
        data: {
          projectId,
          status: 'RUNNING',
        },
      });

  const scanId = scanRecord.id;

  try {
    const scanResult = await scanner.runScan(files, {
      projectId,
      onProgress: (progress) => {
        updateScanProgress({ ...progress, scanId });
      },
    });

    // Update database scan record with scores
    await db.scan.update({
      where: { id: scanId },
      data: {
        status: 'COMPLETED',
        durationMs: scanResult.durationMs,
        overallScore: scanResult.scores.overall,
        grade: scanResult.scores.grade,
        securityScore: scanResult.scores.security,
        qualityScore: scanResult.scores.quality,
        perfScore: scanResult.scores.performance,
        archScore: scanResult.scores.architecture,
        maintainabilityScore: scanResult.scores.maintainability,
        docScore: scanResult.scores.documentation,
        testScore: scanResult.scores.testing,
        completedAt: new Date(),
      },
    });

    // Update project latest stats
    await db.project.update({
      where: { id: projectId },
      data: {
        latestScore: scanResult.scores.overall,
        latestGrade: scanResult.scores.grade,
        updatedAt: new Date(),
      },
    });

    // Save statistics
    await db.statistics.create({
      data: {
        scanId,
        totalFiles: scanResult.metrics.totalFiles,
        totalFolders: scanResult.metrics.totalFolders,
        totalLines: scanResult.metrics.totalLines,
        codeLines: scanResult.metrics.codeLines,
        blankLines: scanResult.metrics.blankLines,
        commentLines: scanResult.metrics.commentLines,
        commentPercentage: scanResult.metrics.commentPercentage,
        classesCount: scanResult.metrics.classesCount,
        functionsCount: scanResult.metrics.functionsCount,
        interfacesCount: scanResult.metrics.interfacesCount,
        cyclomaticComplexity: scanResult.metrics.cyclomaticComplexity,
        cognitiveComplexity: scanResult.metrics.cognitiveComplexity,
        maintainabilityIndex: scanResult.metrics.maintainabilityIndex,
        duplicateLinesCount: scanResult.metrics.duplicateLinesCount,
        duplicatePercentage: scanResult.metrics.duplicatePercentage,
        deadCodeInstances: scanResult.metrics.deadCodeInstances,
      },
    });

    // Save languages
    for (const lang of scanResult.languages) {
      await db.languageMetric.create({
        data: {
          scanId,
          language: cleanUtf8(lang.language),
          filesCount: lang.filesCount,
          linesOfCode: lang.linesOfCode,
          blankLines: lang.blankLines,
          commentLines: lang.commentLines,
          percentage: lang.percentage,
          color: cleanUtf8(lang.color),
        },
      });
    }

    // Save issues
    for (const iss of scanResult.issues) {
      await db.issue.create({
        data: {
          scanId,
          ruleId: cleanUtf8(iss.ruleId),
          title: cleanUtf8(iss.title),
          description: cleanUtf8(iss.description),
          category: cleanUtf8(iss.category),
          severity: cleanUtf8(iss.severity),
          filePath: cleanUtf8(iss.location.filePath),
          startLine: iss.location.startLine,
          endLine: iss.location.endLine,
          snippet: cleanUtf8(iss.location.snippet || ''),
          cwe: iss.cwe ? cleanUtf8(iss.cwe) : null,
          owaspCategory: iss.owaspCategory ? cleanUtf8(iss.owaspCategory) : null,
          remediationJson: iss.remediation ? cleanUtf8(JSON.stringify(iss.remediation)) : null,
          status: 'OPEN',
        },
      });
    }

    // Save dependencies
    for (const dep of scanResult.dependencies) {
      await db.dependency.create({
        data: {
          scanId,
          name: cleanUtf8(dep.name),
          currentVersion: cleanUtf8(dep.currentVersion),
          latestVersion: dep.latestVersion ? cleanUtf8(dep.latestVersion) : null,
          isOutdated: dep.isOutdated,
          license: cleanUtf8(dep.license || 'Unknown'),
          isDirect: dep.isDirect,
          ecosystem: cleanUtf8(dep.ecosystem),
          vulnerabilitiesJson: cleanUtf8(JSON.stringify(dep.vulnerabilities)),
        },
      });
    }

    // Save file records
    for (const file of files.slice(0, 100)) {
      await db.fileRecord.create({
        data: {
          scanId,
          filePath: cleanUtf8(file.path),
          linesCount: file.content.split(/\r?\n/).length,
          fileSize: file.size,
          language: cleanUtf8(file.path.split('.').pop() || 'txt'),
        },
      });
    }

    // Auto-generate reports
    const html = generateInteractiveHtmlReport(scanResult);
    const pdfHtml = generatePrintablePdfHtml(scanResult);
    const csv = generateCsvReport(scanResult);
    const json = generateJsonReport(scanResult);

    await db.report.createMany({
      data: [
        { scanId, format: 'HTML', content: cleanUtf8(html) },
        { scanId, format: 'PDF', content: cleanUtf8(pdfHtml) },
        { scanId, format: 'CSV', content: cleanUtf8(csv) },
        { scanId, format: 'JSON', content: cleanUtf8(json) },
      ],
    });

    return scanResult;
  } catch (error: any) {
    logger.error({ error, scanId }, 'Project scan execution failed');
    await db.scan.update({
      where: { id: scanId },
      data: {
        status: 'FAILED',
        errorMessage: cleanUtf8(error.message || 'Unknown scan failure'),
      },
    });
    throw error;
  }
}
