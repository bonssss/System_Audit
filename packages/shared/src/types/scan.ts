import { z } from 'zod';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type IssueCategory =
  | 'SECURITY'
  | 'CODE_QUALITY'
  | 'COMPLEXITY'
  | 'DEPENDENCY'
  | 'PERFORMANCE'
  | 'ARCHITECTURE'
  | 'API'
  | 'DATABASE'
  | 'TESTS'
  | 'DOCUMENTATION'
  | 'DOCKER'
  | 'KUBERNETES'
  | 'GIT';

export type ProjectGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface CodeLocation {
  filePath: string;
  startLine: number;
  endLine: number;
  startColumn?: number;
  endColumn?: number;
  snippet?: string;
}

export interface AIRemediation {
  title: string;
  severity: Severity;
  summary: string;
  whyItMatters: string;
  businessImpact: string;
  vulnerableExample?: string;
  recommendedFix: string;
  diffPatch?: string;
  estimatedEffort: string; // e.g. "15 minutes", "1 hour"
  confidence: number; // 0 to 100
  references?: string[];
}

export interface ScanIssue {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: Severity;
  location: CodeLocation;
  cwe?: string;
  owaspCategory?: string;
  remediation?: AIRemediation;
  status: 'OPEN' | 'CONFIRMED' | 'RESOLVED' | 'FALSE_POSITIVE' | 'MUTED';
  createdAt: string;
}

export interface LanguageStat {
  language: string;
  filesCount: number;
  linesOfCode: number;
  blankLines: number;
  commentLines: number;
  percentage: number;
  color: string;
}

export interface ProjectMetrics {
  totalFiles: number;
  totalFolders: number;
  totalLines: number;
  codeLines: number;
  blankLines: number;
  commentLines: number;
  commentPercentage: number;
  classesCount: number;
  functionsCount: number;
  interfacesCount: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  duplicateLinesCount: number;
  duplicatePercentage: number;
  deadCodeInstances: number;
}

export interface DependencyItem {
  id: string;
  name: string;
  currentVersion: string;
  latestVersion?: string;
  isOutdated: boolean;
  license?: string;
  isDirect: boolean;
  ecosystem: 'npm' | 'maven' | 'pip' | 'gomod' | 'cargo' | 'composer' | 'nuget' | 'gem';
  vulnerabilities: {
    cve: string;
    severity: Severity;
    title: string;
    fixedIn?: string;
    description?: string;
  }[];
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'module' | 'service' | 'layer' | 'file';
  inDegree: number;
  outDegree: number;
}

export interface ArchitectureEdge {
  source: string;
  target: string;
  weight: number;
  type: 'import' | 'api_call' | 'inheritance';
  isCircular?: boolean;
}

export interface ArchitectureAnalysis {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  circularDependencies: string[][];
  layerViolations: {
    from: string;
    to: string;
    reason: string;
  }[];
  packageCouplingScore: number;
  cohesionScore: number;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'GRAPHQL';
  path: string;
  handler: string;
  filePath: string;
  line: number;
  hasAuth: boolean;
  hasValidation: boolean;
  parameters: string[];
}

export interface DatabaseModel {
  name: string;
  filePath: string;
  fieldsCount: number;
  indexes: string[];
  missingIndexes: string[];
  relationships: {
    target: string;
    type: '1:1' | '1:N' | 'N:M';
  }[];
}

export interface Scores {
  overall: number; // 0 - 100
  grade: ProjectGrade;
  security: number;
  quality: number;
  performance: number;
  architecture: number;
  maintainability: number;
  documentation: number;
  testing: number;
}

export interface ScanResult {
  id: string;
  projectId: string;
  scanDate: string;
  durationMs: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  scores: Scores;
  metrics: ProjectMetrics;
  languages: LanguageStat[];
  issues: ScanIssue[];
  dependencies: DependencyItem[];
  architecture: ArchitectureAnalysis;
  apiEndpoints: ApiEndpoint[];
  databaseModels: DatabaseModel[];
  dockerIssuesCount: number;
  k8sIssuesCount: number;
  gitStats?: {
    totalCommits?: number;
    activeContributors?: number;
    largeCommitsCount?: number;
  };
}

export interface ScanProgress {
  scanId: string;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  percent: number;
  message: string;
  timestamp: string;
}
