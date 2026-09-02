import { ScanIssue } from '@ai-scanner/shared';

export function detectDockerIssues(content: string, filePath: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split(/\r?\n/);
  let hasUserDirective = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // Check base image tag
    if (line.startsWith('FROM ')) {
      const parts = line.split(/\s+/);
      const image = parts[1] || '';
      if (image.endsWith(':latest') || !image.includes(':')) {
        issues.push({
          id: `dock-latest-${lineNum}`,
          ruleId: 'DOCK-TAG-001',
          title: 'Unpinned Docker Image Tag (Using latest or implicit latest)',
          description: `Base image \`${image}\` does not use an immutable sha256 digest or specific version tag.`,
          category: 'DOCKER',
          severity: 'MEDIUM',
          cwe: 'CWE-829',
          location: { filePath, startLine: lineNum, endLine: lineNum, snippet: line },
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Check user directive
    if (line.startsWith('USER ')) {
      hasUserDirective = true;
    }

    // Check curl | sh pipe anti-pattern
    if (/curl\s+[^|]+\|\s*(?:sh|bash)/.test(line)) {
      issues.push({
        id: `dock-curlpipe-${lineNum}`,
        ruleId: 'DOCK-CURL-001',
        title: 'Dangerous Insecure Script Piping (curl | sh)',
        description: 'Piping remote scripts directly to a shell interpreter bypasses integrity checks.',
        category: 'DOCKER',
        severity: 'HIGH',
        cwe: 'CWE-494',
        location: { filePath, startLine: lineNum, endLine: lineNum, snippet: line },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }

    // Check hardcoded passwords in ENV/ARG
    if (/^(?:ENV|ARG)\s+(?:PASSWORD|SECRET|KEY|TOKEN)\s*=/i.test(line)) {
      issues.push({
        id: `dock-secret-${lineNum}`,
        ruleId: 'DOCK-SECRET-001',
        title: 'Hardcoded Secret in Dockerfile ENV/ARG',
        description: 'Values defined in ENV/ARG are baked into image metadata layers and accessible to all image consumers.',
        category: 'DOCKER',
        severity: 'CRITICAL',
        cwe: 'CWE-798',
        location: { filePath, startLine: lineNum, endLine: lineNum, snippet: line },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (!hasUserDirective && lines.length > 3) {
    issues.push({
      id: `dock-root-default`,
      ruleId: 'DOCK-ROOT-001',
      title: 'Container Image Executes as Root User',
      description: 'No explicit USER directive found. Processes in container will run with root permissions.',
      category: 'DOCKER',
      severity: 'HIGH',
      cwe: 'CWE-250',
      location: { filePath, startLine: 1, endLine: 1, snippet: lines[0] || 'FROM ...' },
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });
  }

  return issues;
}

export function detectKubernetesIssues(content: string, filePath: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Privileged container
    if (/privileged:\s*true/i.test(line)) {
      issues.push({
        id: `k8s-priv-${lineNum}`,
        ruleId: 'K8S-PRIVILEGED-001',
        title: 'Kubernetes Pod Running in Privileged Mode',
        description: 'Privileged mode disables container isolation and gives container processes host-level root capabilities.',
        category: 'KUBERNETES',
        severity: 'CRITICAL',
        location: { filePath, startLine: lineNum, endLine: lineNum, snippet: line.trim() },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }

    // HostPath mount
    if (/hostPath:/i.test(line)) {
      issues.push({
        id: `k8s-hostpath-${lineNum}`,
        ruleId: 'K8S-HOSTPATH-001',
        title: 'Insecure hostPath Volume Mount in Pod Spec',
        description: 'Mounting host directories into containers can allow attackers to access host filesystem resources.',
        category: 'KUBERNETES',
        severity: 'HIGH',
        location: { filePath, startLine: lineNum, endLine: lineNum, snippet: line.trim() },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }

    // ReadOnlyRootFilesystem
    if (/readOnlyRootFilesystem:\s*false/i.test(line)) {
      issues.push({
        id: `k8s-readonly-${lineNum}`,
        ruleId: 'K8S-READONLY-001',
        title: 'Writable Root Filesystem Allowed',
        description: 'Allowing container write operations to root filesystem increases malware persistence risk.',
        category: 'KUBERNETES',
        severity: 'LOW',
        location: { filePath, startLine: lineNum, endLine: lineNum, snippet: line.trim() },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return issues;
}
