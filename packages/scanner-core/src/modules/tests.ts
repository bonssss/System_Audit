import { ScanIssue } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';

export interface TestsAnalysisResult {
  hasTests: boolean;
  testFilesCount: number;
  testToCodeRatio: number;
  skippedTestsCount: number;
  issues: ScanIssue[];
}

export function analyzeTests(files: ProjectFileEntry[]): TestsAnalysisResult {
  const issues: ScanIssue[] = [];
  let testFilesCount = 0;
  let skippedTestsCount = 0;
  let codeFilesCount = 0;

  for (const file of files) {
    const isTestFile = /(?:\.test\.|\.spec\.|_test\.|Test\.java|test_.*\.py)/.test(file.path);

    if (isTestFile) {
      testFilesCount++;
      const lines = file.content.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Detect skipped/disabled tests
        if (/(?:\.skip\(|@Disabled|@pytest\.mark\.skip|t\.Skip\()/.test(line)) {
          skippedTestsCount++;
          issues.push({
            id: `test-skip-${file.path}-${lineNum}`,
            ruleId: 'TEST-SKIP-001',
            title: 'Skipped or Disabled Test Case Found',
            description: 'Disabled test case bypasses continuous integration validation and can mask regressions.',
            category: 'TESTS',
            severity: 'LOW',
            location: { filePath: file.path, startLine: lineNum, endLine: lineNum, snippet: line.trim() },
            status: 'OPEN',
            createdAt: new Date().toISOString(),
          });
        }
      }
    } else if (file.path.endsWith('.ts') || file.path.endsWith('.js') || file.path.endsWith('.py') || file.path.endsWith('.java') || file.path.endsWith('.go')) {
      codeFilesCount++;
    }
  }

  const hasTests = testFilesCount > 0;
  const testToCodeRatio = codeFilesCount > 0 ? Math.round((testFilesCount / codeFilesCount) * 100) : 0;

  if (!hasTests && codeFilesCount > 5) {
    issues.push({
      id: 'test-missing-suite',
      ruleId: 'TEST-MISSING-001',
      title: 'No Automated Unit or Integration Test Suite Detected',
      description: 'Project contains application code without automated test files (Jest, PyTest, JUnit, Go Test).',
      category: 'TESTS',
      severity: 'HIGH',
      location: { filePath: 'root', startLine: 1, endLine: 1 },
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });
  }

  return {
    hasTests,
    testFilesCount,
    testToCodeRatio,
    skippedTestsCount,
    issues,
  };
}
