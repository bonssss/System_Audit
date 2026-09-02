import { ScanIssue } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';

export interface DocumentationAnalysisResult {
  hasReadme: boolean;
  readmeQualityScore: number;
  todosCount: number;
  fixmesCount: number;
  issues: ScanIssue[];
}

export function analyzeDocumentation(files: ProjectFileEntry[]): DocumentationAnalysisResult {
  const issues: ScanIssue[] = [];
  let hasReadme = false;
  let readmeQualityScore = 0;
  let todosCount = 0;
  let fixmesCount = 0;

  for (const file of files) {
    const baseName = file.path.split(/[/\\]/).pop() || '';

    // Check README
    if (/^readme(\.md|\.txt|\.rst)?$/i.test(baseName)) {
      hasReadme = true;
      let score = 40; // Base score for having one
      if (file.content.length > 500) score += 20;
      if (file.content.length > 1500) score += 20;
      if (file.content.includes('## Install') || file.content.includes('## Setup') || file.content.includes('npm install')) score += 10;
      if (file.content.includes('## Usage') || file.content.includes('## API')) score += 10;
      readmeQualityScore = Math.min(100, score);
    }

    // Scan for TODO / FIXME / HACK / XXX
    const lines = file.content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      const todoMatch = line.match(/\b(TODO|FIXME|HACK|XXX)\b(?:\s*[:(]?\s*(.*))?/i);
      if (todoMatch) {
        const tag = todoMatch[1].toUpperCase();
        if (tag === 'FIXME') fixmesCount++;
        else todosCount++;

        issues.push({
          id: `doc-${tag.toLowerCase()}-${file.path}-${lineNum}`,
          ruleId: tag === 'FIXME' ? 'DOC-FIXME-001' : 'DOC-TODO-001',
          title: `Technical Debt Marker: ${tag}`,
          description: `Unresolved technical debt note: "${todoMatch[2] ? todoMatch[2].substring(0, 80) : tag}"`,
          category: 'DOCUMENTATION',
          severity: tag === 'FIXME' ? 'MEDIUM' : 'INFO',
          location: { filePath: file.path, startLine: lineNum, endLine: lineNum, snippet: line.trim() },
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  if (!hasReadme) {
    issues.push({
      id: 'doc-no-readme',
      ruleId: 'DOC-README-001',
      title: 'Missing Project README Documentation',
      description: 'Project root lacks a README.md file explaining setup, usage, architecture, and contributing guidelines.',
      category: 'DOCUMENTATION',
      severity: 'MEDIUM',
      location: { filePath: 'README.md', startLine: 1, endLine: 1 },
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });
  }

  return {
    hasReadme,
    readmeQualityScore: hasReadme ? readmeQualityScore : 0,
    todosCount,
    fixmesCount,
    issues,
  };
}
