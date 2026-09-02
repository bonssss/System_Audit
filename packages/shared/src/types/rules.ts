import { IssueCategory, Severity } from './scan';

export interface RuleDefinition {
  id: string;
  name: string;
  category: IssueCategory;
  severity: Severity;
  description: string;
  explanation: string;
  impact: string;
  recommendation: string;
  cwe?: string;
  owaspCategory?: string;
  languages: string[];
  tags: string[];
  effort: string;
}

export type RuleMap = Record<string, RuleDefinition>;
