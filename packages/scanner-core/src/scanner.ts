import {
  calculateProjectScores,
  ScanIssue,
  ScanProgress,
  ScanResult,
  STANDARD_RULES,
} from '@ai-scanner/shared';
import { SecurityAnalysisEngine } from '@ai-scanner/security';
import { analyzeProjectStatistics, ProjectFileEntry } from './modules/statistics';
import { analyzeCodeQuality } from './modules/quality';
import { analyzeComplexity } from './modules/complexity';
import { analyzeDependencies } from './modules/dependencies';
import { analyzePerformance } from './modules/performance';
import { analyzeArchitecture } from './modules/architecture';
import { analyzeApis } from './modules/api';
import { analyzeDatabase } from './modules/database';
import { analyzeTests } from './modules/tests';
import { analyzeDocumentation } from './modules/documentation';
import { analyzeGitHistory } from './modules/git';

export interface ScanOptions {
  projectId: string;
  scanId?: string;
  onProgress?: (progress: ScanProgress) => void;
}

export class ProjectScanner {
  private securityEngine = new SecurityAnalysisEngine();

  public async runScan(files: ProjectFileEntry[], options: ScanOptions): Promise<ScanResult> {
    const startTime = Date.now();
    const scanId = options.scanId || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const allIssues: ScanIssue[] = [];

    const reportProgress = (step: number, total: number, name: string, msg: string) => {
      if (options.onProgress) {
        options.onProgress({
          scanId,
          currentStep: step,
          totalSteps: total,
          stepName: name,
          percent: Math.round((step / total) * 100),
          message: msg,
          timestamp: new Date().toISOString(),
        });
      }
    };

    const TOTAL_STEPS = 14;

    // 1. Files & Structural parsing
    reportProgress(1, TOTAL_STEPS, 'Project Discovery', `Ingesting and tokenizing ${files.length} project files...`);

    // 2. Security & Secrets scanning
    reportProgress(2, TOTAL_STEPS, 'Security & Secrets Scan', 'Running OWASP & CWE vulnerability analyzers...');
    let dockerIssuesCount = 0;
    let k8sIssuesCount = 0;

    for (const file of files) {
      const secIssues = this.securityEngine.scanFile(file.content, file.path);
      for (const iss of secIssues) {
        if (iss.category === 'DOCKER') dockerIssuesCount++;
        if (iss.category === 'KUBERNETES') k8sIssuesCount++;
        allIssues.push(iss);
      }
    }

    // 3. Code Quality & Code Smells
    reportProgress(3, TOTAL_STEPS, 'Code Quality Analysis', 'Detecting code smells, god classes, and duplication...');
    const qualityResult = analyzeCodeQuality(files);
    allIssues.push(...qualityResult.issues);

    // 4. Complexity & Maintainability
    reportProgress(4, TOTAL_STEPS, 'Complexity & Metrics', 'Computing cyclomatic & cognitive complexity metrics...');
    const complexityResult = analyzeComplexity(files);
    allIssues.push(...complexityResult.issues);

    // 5. Dependency & CVE Analysis
    reportProgress(5, TOTAL_STEPS, 'Dependency Vulnerabilities', 'Parsing lockfiles and matching known CVE database...');
    const depResult = analyzeDependencies(files);
    allIssues.push(...depResult.issues);

    // 6. Performance Analysis
    reportProgress(6, TOTAL_STEPS, 'Performance Audit', 'Scanning for N+1 queries, blocking I/O, and nested loops...');
    const perfResult = analyzePerformance(files);
    allIssues.push(...perfResult.issues);

    // 7. Architecture & Coupling
    reportProgress(7, TOTAL_STEPS, 'Architecture & Graph', 'Building dependency graph and checking circular dependencies...');
    const archResult = analyzeArchitecture(files);
    allIssues.push(...archResult.issues);

    // 8. API & Route Analysis
    reportProgress(8, TOTAL_STEPS, 'API Surface Extraction', 'Extracting REST/GraphQL endpoints and checking auth gates...');
    const apiResult = analyzeApis(files);
    allIssues.push(...apiResult.issues);

    // 9. Database & Index Analysis
    reportProgress(9, TOTAL_STEPS, 'Database & ORM Audit', 'Inspecting entities, relationships, and missing foreign key indexes...');
    const dbResult = analyzeDatabase(files);
    allIssues.push(...dbResult.issues);

    // 10. Testing & Coverage Check
    reportProgress(10, TOTAL_STEPS, 'Test Suite Evaluation', 'Analyzing test suites, coverage ratios, and skipped tests...');
    const testResult = analyzeTests(files);
    allIssues.push(...testResult.issues);

    // 11. Documentation & Debt Tracker
    reportProgress(11, TOTAL_STEPS, 'Documentation & Tech Debt', 'Checking README completeness, docstrings, and TODO/FIXME markers...');
    const docResult = analyzeDocumentation(files);
    allIssues.push(...docResult.issues);

    // 12. Git & Repository Health
    reportProgress(12, TOTAL_STEPS, 'Repository Health', 'Inspecting git metadata and contributor distribution...');
    const gitResult = analyzeGitHistory(files);
    allIssues.push(...gitResult.issues);

    // 13. Project Statistics Aggregation
    reportProgress(13, TOTAL_STEPS, 'Metric Aggregation', 'Aggregating lines of code and language distribution...');
    const statsResult = analyzeProjectStatistics(
      files,
      25,
      120,
      15,
      complexityResult.cyclomaticComplexity,
      complexityResult.cognitiveComplexity,
      complexityResult.maintainabilityIndex
    );

    statsResult.metrics.duplicateLinesCount = qualityResult.duplicateLinesCount;
    statsResult.metrics.duplicatePercentage = qualityResult.duplicatePercentage;
    statsResult.metrics.deadCodeInstances = qualityResult.deadCodeInstances;

    // 14. Scoring & AI Remediation Enrichment
    reportProgress(14, TOTAL_STEPS, 'Scoring & Synthesis', 'Synthesizing overall project score and grade...');

    // Enrich issues with remediation metadata from rule catalog
    for (const issue of allIssues) {
      const rule = STANDARD_RULES[issue.ruleId];
      if (rule && !issue.remediation) {
        issue.remediation = {
          title: issue.title,
          severity: issue.severity,
          summary: rule.description,
          whyItMatters: rule.explanation,
          businessImpact: rule.impact,
          recommendedFix: rule.recommendation,
          vulnerableExample: issue.location.snippet || 'Vulnerable code snippet',
          diffPatch: `--- a/${issue.location.filePath}\n+++ b/${issue.location.filePath}\n@@ -${issue.location.startLine},1 +${issue.location.startLine},1 @@\n- ${issue.location.snippet || '// vulnerable'}\n+ // Recommended Secure Replacement\n+ ${rule.recommendation}`,
          estimatedEffort: rule.effort || '20 minutes',
          confidence: 95,
          references: [rule.cwe ? `https://cwe.mitre.org/data/definitions/${rule.cwe.replace('CWE-', '')}.html` : 'https://owasp.org'],
        };
      }
    }

    const scores = calculateProjectScores(allIssues, {
      hasReadme: docResult.hasReadme,
      hasTests: testResult.hasTests,
      maintainabilityIndex: complexityResult.maintainabilityIndex,
    });

    const durationMs = Date.now() - startTime;

    return {
      id: scanId,
      projectId: options.projectId,
      scanDate: new Date().toISOString(),
      durationMs,
      status: 'COMPLETED',
      scores,
      metrics: statsResult.metrics,
      languages: statsResult.languages,
      issues: allIssues,
      dependencies: depResult.dependencies,
      architecture: archResult.architecture,
      apiEndpoints: apiResult.endpoints,
      databaseModels: dbResult.models,
      dockerIssuesCount,
      k8sIssuesCount,
      gitStats: gitResult.stats,
    };
  }
}
