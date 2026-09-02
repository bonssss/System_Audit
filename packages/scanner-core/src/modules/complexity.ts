import { ScanIssue } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';
import { calculateCyclomaticComplexity, calculateCognitiveComplexity, calculateMaintainabilityIndex } from '@ai-scanner/parser';

export interface ComplexityAnalysisResult {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  issues: ScanIssue[];
}

export function analyzeComplexity(files: ProjectFileEntry[]): ComplexityAnalysisResult {
  let totalCyclomatic = 0;
  let totalCognitive = 0;
  let totalMaintainability = 0;
  let analyzedFileCount = 0;
  const issues: ScanIssue[] = [];

  for (const file of files) {
    if (file.path.endsWith('.json') || file.path.endsWith('.lock') || file.path.endsWith('.md') || file.path.endsWith('.yaml')) {
      continue;
    }

    const cyclo = calculateCyclomaticComplexity(file.content);
    const cogn = calculateCognitiveComplexity(file.content);
    const linesCount = file.content.split(/\r?\n/).length;
    const mi = calculateMaintainabilityIndex(linesCount, cyclo.cyclomaticComplexity, 15);

    totalCyclomatic += cyclo.cyclomaticComplexity;
    totalCognitive += cogn.cognitiveComplexity;
    totalMaintainability += mi;
    analyzedFileCount++;

    // High complexity function issues
    for (const func of cyclo.highComplexityFunctions) {
      issues.push({
        id: `comp-cyclo-${file.path}-${func.line}`,
        ruleId: 'QUAL-LONGMETHOD-001',
        title: `High Cyclomatic Complexity in \`${func.name}\` (Score: ${func.complexity})`,
        description: `Function \`${func.name}\` has cyclomatic complexity of ${func.complexity}, indicating excessive branching paths.`,
        category: 'COMPLEXITY',
        severity: func.complexity > 20 ? 'HIGH' : 'MEDIUM',
        location: { filePath: file.path, startLine: func.line, endLine: func.line + 20 },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }

    // Deep nesting issues
    for (const nest of cogn.deepNestingLocations) {
      issues.push({
        id: `comp-nest-${file.path}-${nest.line}`,
        ruleId: 'QUAL-DEEPNEST-001',
        title: `Excessive Control Flow Nesting (Depth: ${nest.depth})`,
        description: `Block nesting level (${nest.depth}) exceeds maximum recommended depth of 4.`,
        category: 'COMPLEXITY',
        severity: 'MEDIUM',
        location: { filePath: file.path, startLine: nest.line, endLine: nest.line, snippet: nest.snippet },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }

    // Low maintainability warning
    if (mi < 40 && linesCount > 50) {
      issues.push({
        id: `comp-mi-${file.path}`,
        ruleId: 'QUAL-GODCLASS-001',
        title: `Critically Low Maintainability Index (${mi}/100)`,
        description: `File has an extremely low maintainability score (${mi}/100) due to high complexity and line count.`,
        category: 'COMPLEXITY',
        severity: 'HIGH',
        location: { filePath: file.path, startLine: 1, endLine: linesCount },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }
  }

  const avgMaintainability = analyzedFileCount > 0 ? Math.round(totalMaintainability / analyzedFileCount) : 85;

  return {
    cyclomaticComplexity: totalCyclomatic,
    cognitiveComplexity: totalCognitive,
    maintainabilityIndex: avgMaintainability,
    issues,
  };
}
