import { ScanIssue } from '@ai-scanner/shared';
import { detectSecrets } from './detectors/secrets';
import { detectVulnerabilities } from './detectors/vulnerabilities';
import { detectDockerIssues, detectKubernetesIssues } from './detectors/docker-k8s';

export class SecurityAnalysisEngine {
  public scanFile(content: string, filePath: string): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const baseName = filePath.split(/[/\\]/).pop() || '';

    // 1. Secrets check (all files)
    const secretIssues = detectSecrets(content, filePath);
    issues.push(...secretIssues);

    // 2. Vulnerabilities check (source files)
    const vulnIssues = detectVulnerabilities(content, filePath);
    issues.push(...vulnIssues);

    // 3. Container checks
    if (baseName.toLowerCase() === 'dockerfile' || baseName.toLowerCase().startsWith('dockerfile.')) {
      const dockerIssues = detectDockerIssues(content, filePath);
      issues.push(...dockerIssues);
    }

    if (baseName.endsWith('.yaml') || baseName.endsWith('.yml')) {
      if (content.includes('apiVersion:') && content.includes('kind:')) {
        const k8sIssues = detectKubernetesIssues(content, filePath);
        issues.push(...k8sIssues);
      }
    }

    return issues;
  }
}
