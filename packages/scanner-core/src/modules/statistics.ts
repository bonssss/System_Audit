import { LanguageStat, ProjectMetrics, detectLanguageFromFilename, SUPPORTED_LANGUAGES } from '@ai-scanner/shared';
import { analyzeLineMetrics } from '@ai-scanner/parser';

export interface ProjectFileEntry {
  path: string;
  content: string;
  size: number;
}

export interface StatisticsResult {
  metrics: ProjectMetrics;
  languages: LanguageStat[];
}

export function analyzeProjectStatistics(
  files: ProjectFileEntry[],
  classesCount: number,
  functionsCount: number,
  interfacesCount: number,
  cyclomaticComplexity: number,
  cognitiveComplexity: number,
  maintainabilityIndex: number
): StatisticsResult {
  const folders = new Set<string>();
  let totalLines = 0;
  let codeLines = 0;
  let blankLines = 0;
  let commentLines = 0;

  const langMap: Record<string, { filesCount: number; linesOfCode: number; blankLines: number; commentLines: number; color: string; name: string }> = {};

  for (const file of files) {
    // Add parent folders
    const parts = file.path.split(/[/\\]/);
    if (parts.length > 1) {
      let currentFolder = '';
      for (let i = 0; i < parts.length - 1; i++) {
        currentFolder = currentFolder ? `${currentFolder}/${parts[i]}` : parts[i];
        folders.add(currentFolder);
      }
    }

    const langMeta = detectLanguageFromFilename(file.path);
    const lineStats = analyzeLineMetrics(file.content, langMeta);

    totalLines += lineStats.totalLines;
    codeLines += lineStats.codeLines;
    blankLines += lineStats.blankLines;
    commentLines += lineStats.commentLines;

    const langKey = langMeta?.name || 'Other';
    const langColor = langMeta?.color || '#8B949E';

    if (!langMap[langKey]) {
      langMap[langKey] = {
        name: langKey,
        filesCount: 0,
        linesOfCode: 0,
        blankLines: 0,
        commentLines: 0,
        color: langColor,
      };
    }

    langMap[langKey].filesCount += 1;
    langMap[langKey].linesOfCode += lineStats.codeLines;
    langMap[langKey].blankLines += lineStats.blankLines;
    langMap[langKey].commentLines += lineStats.commentLines;
  }

  const commentPercentage = totalLines > 0 ? Math.round((commentLines / totalLines) * 100) : 0;

  // Language breakdown with percentages
  const languages: LanguageStat[] = Object.values(langMap).map((l) => ({
    language: l.name,
    filesCount: l.filesCount,
    linesOfCode: l.linesOfCode,
    blankLines: l.blankLines,
    commentLines: l.commentLines,
    percentage: codeLines > 0 ? Math.round((l.linesOfCode / codeLines) * 100) : 0,
    color: l.color,
  })).sort((a, b) => b.linesOfCode - a.linesOfCode);

  const metrics: ProjectMetrics = {
    totalFiles: files.length,
    totalFolders: folders.size,
    totalLines,
    codeLines,
    blankLines,
    commentLines,
    commentPercentage,
    classesCount,
    functionsCount,
    interfacesCount,
    cyclomaticComplexity,
    cognitiveComplexity,
    maintainabilityIndex,
    duplicateLinesCount: 0,
    duplicatePercentage: 0,
    deadCodeInstances: 0,
  };

  return { metrics, languages };
}
