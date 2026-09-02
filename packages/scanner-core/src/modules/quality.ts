import { ScanIssue } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';
import { parseFileStructure } from '@ai-scanner/parser';

export interface QualityAnalysisResult {
  issues: ScanIssue[];
  duplicateLinesCount: number;
  duplicatePercentage: number;
  deadCodeInstances: number;
}

export function analyzeCodeQuality(files: ProjectFileEntry[]): QualityAnalysisResult {
  const issues: ScanIssue[] = [];
  let deadCodeInstances = 0;

  // Track code blocks for duplication detection (block size = 6 lines)
  const blockHashMap = new Map<string, { path: string; line: number }[]>();
  let totalComparedLines = 0;
  let duplicateLines = 0;

  for (const file of files) {
    if (file.path.endsWith('.json') || file.path.endsWith('.lock') || file.path.endsWith('.md')) {
      continue;
    }

    const lines = file.content.split(/\r?\n/);
    totalComparedLines += lines.length;
    const structure = parseFileStructure(file.content, file.path);

    // 1. Large Files & God Classes
    if (lines.length > 500) {
      issues.push({
        id: `qual-largefile-${file.path}`,
        ruleId: 'QUAL-GODCLASS-001',
        title: `Large File / Potential God Module (${lines.length} LOC)`,
        description: `File contains ${lines.length} lines of code, exceeding recommended maintainability threshold (500 LOC).`,
        category: 'CODE_QUALITY',
        severity: lines.length > 1000 ? 'HIGH' : 'MEDIUM',
        location: { filePath: file.path, startLine: 1, endLine: lines.length },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }

    for (const sym of structure.symbols) {
      if (sym.kind === 'class') {
        // God class check
        const classMethods = structure.symbols.filter((s) => s.kind === 'method' || s.kind === 'function');
        if (classMethods.length > 25) {
          issues.push({
            id: `qual-godclass-${sym.name}-${file.path}`,
            ruleId: 'QUAL-GODCLASS-001',
            title: `God Class Anti-Pattern in \`${sym.name}\``,
            description: `Class \`${sym.name}\` declares ${classMethods.length} methods, violating the Single Responsibility Principle.`,
            category: 'CODE_QUALITY',
            severity: 'HIGH',
            location: { filePath: file.path, startLine: sym.line, endLine: sym.line + 50 },
            status: 'OPEN',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // 2. Line-by-line quality rules
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      const trimmed = line.trim();

      // Dead code: statement directly after return/throw
      if (/^(?:return|throw\s+new)\b/.test(trimmed) && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !nextLine.startsWith('}') && !nextLine.startsWith('//') && !nextLine.startsWith('case ') && !nextLine.startsWith('default:')) {
          deadCodeInstances++;
          issues.push({
            id: `qual-deadcode-${file.path}-${lineNum}`,
            ruleId: 'QUAL-DEADCODE-001',
            title: 'Unreachable Statement After Return / Throw',
            description: `Code following return or throw statement at line ${lineNum} is unreachable.`,
            category: 'CODE_QUALITY',
            severity: 'LOW',
            location: { filePath: file.path, startLine: lineNum + 1, endLine: lineNum + 1, snippet: nextLine },
            status: 'OPEN',
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Magic numbers
      if (
        /(?:===|==|!==|!=|>|<|>=|<=|\+|-|\*|\/)\s*([0-9]{4,9})\b/.test(line) &&
        !line.includes('const') &&
        !line.includes('PORT') &&
        !line.includes('STATUS') &&
        !line.includes('//')
      ) {
        issues.push({
          id: `qual-magicnum-${file.path}-${lineNum}`,
          ruleId: 'QUAL-MAGICNUM-001',
          title: 'Hardcoded Magic Number',
          description: 'Unnamed numerical literal used in calculation or condition. Extract into a named constant.',
          category: 'CODE_QUALITY',
          severity: 'LOW',
          location: { filePath: file.path, startLine: lineNum, endLine: lineNum, snippet: trimmed },
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        });
      }

      // Single-letter variable names outside loops
      if (
        /(?:const|let|var)\s+([a-z])\s*=\s*/.test(line) &&
        !line.includes('for (') &&
        !line.includes('for(') &&
        !line.includes('.map(') &&
        !line.includes('.reduce(')
      ) {
        issues.push({
          id: `qual-badname-${file.path}-${lineNum}`,
          ruleId: 'QUAL-BADNAME-001',
          title: 'Cryptic Single-Letter Variable Identifier',
          description: 'Single-letter variable name reduces readability and self-documenting code clarity.',
          category: 'CODE_QUALITY',
          severity: 'INFO',
          location: { filePath: file.path, startLine: lineNum, endLine: lineNum, snippet: trimmed },
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 3. Duplication check (6-line sliding window)
    const windowSize = 6;
    if (lines.length >= windowSize) {
      for (let i = 0; i <= lines.length - windowSize; i++) {
        const chunk = lines
          .slice(i, i + windowSize)
          .map((l) => l.trim())
          .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('/*'))
          .join('\n');

        if (chunk.length > 50) {
          const key = chunk;
          const existing = blockHashMap.get(key) || [];
          existing.push({ path: file.path, line: i + 1 });
          blockHashMap.set(key, existing);
        }
      }
    }
  }

  // Aggregate duplicates
  for (const [_, matches] of blockHashMap.entries()) {
    if (matches.length > 1) {
      const primary = matches[0];
      const dup = matches[1];
      duplicateLines += 6;
      issues.push({
        id: `qual-dup-${primary.path}-${primary.line}`,
        ruleId: 'QUAL-DUP-001',
        title: `Duplicate Code Block Detected (${matches.length} occurrences)`,
        description: `Identical block of code found in \`${primary.path}:${primary.line}\` and \`${dup.path}:${dup.line}\`.`,
        category: 'CODE_QUALITY',
        severity: 'MEDIUM',
        location: { filePath: primary.path, startLine: primary.line, endLine: primary.line + 6 },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }
  }

  const duplicatePercentage = totalComparedLines > 0 ? Math.min(100, Math.round((duplicateLines / totalComparedLines) * 100)) : 0;

  return {
    issues,
    duplicateLinesCount: duplicateLines,
    duplicatePercentage,
    deadCodeInstances,
  };
}
