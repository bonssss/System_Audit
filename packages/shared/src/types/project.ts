import { z } from 'zod';

export interface ProjectDto {
  id: string;
  name: string;
  description?: string | null;
  repositoryUrl?: string | null;
  branch?: string;
  sourceType: 'ZIP_UPLOAD' | 'GITHUB' | 'GITLAB' | 'BITBUCKET' | 'LOCAL';
  createdAt: string;
  updatedAt: string;
  lastScanDate?: string | null;
  latestScore?: number | null;
  latestGrade?: string | null;
  scansCount: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
}

export interface UserDto {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'DEVELOPER' | 'AUDITOR';
  avatarUrl?: string | null;
}

export const CreateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  repositoryUrl: z.string().url('Invalid repository URL').optional().or(z.literal('')),
  branch: z.string().default('main'),
  sourceType: z.enum(['ZIP_UPLOAD', 'GITHUB', 'GITLAB', 'BITBUCKET', 'LOCAL']).default('ZIP_UPLOAD'),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
