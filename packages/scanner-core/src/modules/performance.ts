import { ScanIssue } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';

export interface PerformanceAnalysisResult {
  issues: ScanIssue[];
}

export function analyzePerformance(files: ProjectFileEntry[]): PerformanceAnalysisResult {
  const issues: ScanIssue[] = [];

  for (const file of files) {
    if (file.path.endsWith('.json') || file.path.endsWith('.lock') || file.path.endsWith('.md')) {
      continue;
    }

    const lines = file.content.split(/\r?\n/);
    let loopDepth = 0;
    let loopStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      const trimmed = line.trim();

      // 1. Check loop nesting
      const isLoop = /\b(for\s*\(|while\s*\(|for\s+[a-zA-Z0-9_]+\s+in|\.forEach\(|\.map\(|\.flatMap\()/i.test(trimmed);
      if (isLoop) {
        if (loopDepth === 0) loopStartLine = lineNum;
        loopDepth++;
        if (loopDepth >= 3) {
          issues.push({
            id: `perf-nestedloop-${file.path}-${lineNum}`,
            ruleId: 'PERF-NESTEDLOOP-001',
            title: `Deeply Nested Loop Anti-Pattern (O(n^${loopDepth}))`,
            description: `Loop nesting depth ${loopDepth} found. High polynomial complexity can cause severe performance degradation on large datasets.`,
            category: 'PERFORMANCE',
            severity: loopDepth >= 3 ? 'HIGH' : 'MEDIUM',
            location: { filePath: file.path, startLine: loopStartLine, endLine: lineNum, snippet: trimmed },
            status: 'OPEN',
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Check loop closure roughly
      if (trimmed.includes('}') || (trimmed.endsWith(')') && isLoop)) {
        loopDepth = Math.max(0, loopDepth - 1);
      }

      // 2. N+1 Query in Loop
      if (
        loopDepth > 0 &&
        /\b(await\s+.*\.(?:find|findOne|findMany|query|select|get|fetch|exec)|db\..*\.find|SELECT\s+.*FROM)\b/i.test(line)
      ) {
        issues.push({
          id: `perf-nplus1-${file.path}-${lineNum}`,
          ruleId: 'PERF-NPLUS1-001',
          title: 'N+1 Database Query Pattern in Loop',
          description: 'Database query executed inside a loop. This generates N individual database roundtrips instead of a batched join.',
          category: 'PERFORMANCE',
          severity: 'HIGH',
          location: { filePath: file.path, startLine: lineNum, endLine: lineNum, snippet: trimmed },
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        });
      }

      // 3. Blocking synchronous I/O
      if (
        /\b(fs\.readFileSync|fs\.writeFileSync|fs\.existsSync|time\.sleep|Thread\.sleep|execSync)\b/.test(trimmed) &&
        !file.path.includes('test') &&
        !file.path.includes('spec') &&
        !file.path.includes('script')
      ) {
        issues.push({
          id: `perf-syncio-${file.path}-${lineNum}`,
          ruleId: 'PERF-SYNCIO-001',
          title: 'Blocking Synchronous Call on Runtime Thread',
          description: `Call to synchronous API \`${trimmed.split('(')[0]}\` blocks the runtime event loop for all concurrent requests.`,
          category: 'PERFORMANCE',
          severity: 'HIGH',
          location: { filePath: file.path, startLine: lineNum, endLine: lineNum, snippet: trimmed },
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        });
      }

      // 4. Missing query limit / Unbounded fetch
      if (
        /\b(?:SELECT\s+\*\s+FROM|prisma\.[a-zA-Z]+\.findMany\(\s*\)|User\.find\(\s*\))\b/i.test(trimmed) &&
        !line.includes('limit') &&
        !line.includes('take') &&
        !line.includes('WHERE') &&
        !line.includes('where')
      ) {
        issues.push({
          id: `perf-unbounded-${file.path}-${lineNum}`,
          ruleId: 'PERF-UNBOUND-001',
          title: 'Unbounded Table Query Without LIMIT / Pagination',
          description: 'Executing database query across full table without pagination or limit clause can cause out-of-memory crashes.',
          category: 'PERFORMANCE',
          severity: 'MEDIUM',
          location: { filePath: file.path, startLine: lineNum, endLine: lineNum, snippet: trimmed },
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return { issues };
}
