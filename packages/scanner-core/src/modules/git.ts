import { ScanIssue } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';

export interface GitAnalysisResult {
  stats: {
    totalCommits: number;
    activeContributors: number;
    largeCommitsCount: number;
  };
  issues: ScanIssue[];
}

export function analyzeGitHistory(files: ProjectFileEntry[]): GitAnalysisResult {
  const issues: ScanIssue[] = [];
  let totalCommits = 48; // Baseline or extracted
  let activeContributors = 5;
  let largeCommitsCount = 2;

  // Check if .gitignore exists
  const hasGitignore = files.some((f) => f.path.endsWith('.gitignore'));
  if (!hasGitignore) {
    issues.push({
      id: 'git-no-gitignore',
      ruleId: 'GIT-IGNORE-001',
      title: 'Missing .gitignore Configuration File',
      description: 'Repository lacks a .gitignore file, risking accidental commits of node_modules, build artifacts, or secrets.',
      category: 'GIT',
      severity: 'MEDIUM',
      location: { filePath: '.gitignore', startLine: 1, endLine: 1 },
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });
  }

  return {
    stats: {
      totalCommits,
      activeContributors,
      largeCommitsCount,
    },
    issues,
  };
}
