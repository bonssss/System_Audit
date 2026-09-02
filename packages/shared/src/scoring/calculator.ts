import { IssueCategory, ProjectGrade, ScanIssue, Scores, Severity } from '../types/scan';

export interface ScoreWeights {
  securityWeight: number;
  qualityWeight: number;
  performanceWeight: number;
  architectureWeight: number;
  maintainabilityWeight: number;
  docWeight: number;
  testWeight: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  securityWeight: 0.35,
  qualityWeight: 0.15,
  performanceWeight: 0.15,
  architectureWeight: 0.15,
  maintainabilityWeight: 0.10,
  docWeight: 0.05,
  testWeight: 0.05,
};

const SEVERITY_PENALTIES: Record<Severity, number> = {
  CRITICAL: 25,
  HIGH: 12,
  MEDIUM: 5,
  LOW: 2,
  INFO: 0.5,
};

export function calculateCategoryScore(
  issues: ScanIssue[],
  category: IssueCategory,
  baselineScore: number = 100
): number {
  const categoryIssues = issues.filter((i) => i.category === category && i.status !== 'FALSE_POSITIVE' && i.status !== 'MUTED');
  let penalty = 0;
  for (const issue of categoryIssues) {
    penalty += SEVERITY_PENALTIES[issue.severity] || 1;
  }
  return Math.max(0, Math.min(100, Math.round(baselineScore - penalty)));
}

export function determineGrade(score: number): ProjectGrade {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function calculateProjectScores(
  issues: ScanIssue[],
  customMetrics?: {
    hasReadme?: boolean;
    hasTests?: boolean;
    maintainabilityIndex?: number;
  },
  weights: ScoreWeights = DEFAULT_WEIGHTS
): Scores {
  const securityScore = calculateCategoryScore(issues, 'SECURITY');
  const qualityScore = calculateCategoryScore(issues, 'CODE_QUALITY');
  const perfScore = calculateCategoryScore(issues, 'PERFORMANCE');
  const archScore = calculateCategoryScore(issues, 'ARCHITECTURE');
  
  // Maintainability
  let baseMaintainability = customMetrics?.maintainabilityIndex || 85;
  const complexityPenalty = calculateCategoryScore(issues, 'COMPLEXITY');
  const maintainabilityScore = Math.round((baseMaintainability * 0.6) + (complexityPenalty * 0.4));

  // Documentation
  let docBase = customMetrics?.hasReadme ? 85 : 50;
  const docPenalty = calculateCategoryScore(issues, 'DOCUMENTATION');
  const docScore = Math.min(100, Math.round((docBase * 0.5) + (docPenalty * 0.5)));

  // Testing
  let testBase = customMetrics?.hasTests ? 85 : 40;
  const testPenalty = calculateCategoryScore(issues, 'TESTS');
  const testScore = Math.min(100, Math.round((testBase * 0.5) + (testPenalty * 0.5)));

  const overall = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        securityScore * weights.securityWeight +
        qualityScore * weights.qualityWeight +
        perfScore * weights.performanceWeight +
        archScore * weights.architectureWeight +
        maintainabilityScore * weights.maintainabilityWeight +
        docScore * weights.docWeight +
        testScore * weights.testWeight
      )
    )
  );

  return {
    overall,
    grade: determineGrade(overall),
    security: securityScore,
    quality: qualityScore,
    performance: perfScore,
    architecture: archScore,
    maintainability: maintainabilityScore,
    documentation: docScore,
    testing: testScore,
  };
}
