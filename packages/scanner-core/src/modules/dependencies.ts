import { DependencyItem, ScanIssue, Severity } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';

interface KnownVulnerability {
  name: string;
  affectedVersions: string;
  cve: string;
  severity: Severity;
  title: string;
  description: string;
  fixedIn: string;
}

// Built-in CVE / Security Advisory Knowledgebase for instant offline scanning
const KNOWN_CVE_DATABASE: KnownVulnerability[] = [
  {
    name: 'jsonwebtoken',
    affectedVersions: '<=8.5.1',
    cve: 'CVE-2022-23529',
    severity: 'CRITICAL',
    title: 'Arbitrary Code Execution via jwt.verify() secretOrPublicKey',
    description: 'jsonwebtoken before 9.0.0 is vulnerable to arbitrary code execution if an attacker can control secretOrPublicKey.',
    fixedIn: '9.0.0',
  },
  {
    name: 'lodash',
    affectedVersions: '<4.17.21',
    cve: 'CVE-2021-23337',
    severity: 'HIGH',
    title: 'Command Injection via template function',
    description: 'Prototype pollution and command injection in lodash versions prior to 4.17.21.',
    fixedIn: '4.17.21',
  },
  {
    name: 'axios',
    affectedVersions: '<0.21.1',
    cve: 'CVE-2020-28168',
    severity: 'MEDIUM',
    title: 'SSRF / Header Exfiltration via Proxy',
    description: 'Axios allows SSRF by following redirects to internal network addresses while retaining auth headers.',
    fixedIn: '0.21.1',
  },
  {
    name: 'log4j-core',
    affectedVersions: '2.0-beta9 to 2.14.1',
    cve: 'CVE-2021-44228',
    severity: 'CRITICAL',
    title: 'Log4Shell JNDI Remote Code Execution',
    description: 'Apache Log4j2 JNDI features used in configuration and messages do not protect against attacker controlled LDAP/RMI.',
    fixedIn: '2.15.0',
  },
  {
    name: 'spring-beans',
    affectedVersions: '<5.3.18',
    cve: 'CVE-2022-22965',
    severity: 'CRITICAL',
    title: 'Spring4Shell Remote Code Execution',
    description: 'Spring Framework RCE via Data Binding on JDK 9+ allowing arbitrary file write in webapps.',
    fixedIn: '5.3.18',
  },
  {
    name: 'django',
    affectedVersions: '<3.2.14',
    cve: 'CVE-2022-34265',
    severity: 'HIGH',
    title: 'SQL Injection in Trunc() and Extract() database functions',
    description: 'Django Trunc and Extract database functions are subject to SQL injection in lookup_name/kind arguments.',
    fixedIn: '3.2.14',
  },
  {
    name: 'requests',
    affectedVersions: '<2.20.0',
    cve: 'CVE-2018-18074',
    severity: 'HIGH',
    title: 'Session Authentication Leak on HTTP Redirect',
    description: 'Requests library leaks HTTP Basic Auth credentials across cross-host redirects.',
    fixedIn: '2.20.0',
  },
  {
    name: 'fastapi',
    affectedVersions: '<0.65.2',
    cve: 'CVE-2021-32677',
    severity: 'MEDIUM',
    title: 'CORS Middleware Regex Bypass',
    description: 'CORS header validation bypass in FastAPI allows unauthorized origin access.',
    fixedIn: '0.65.2',
  },
];

export interface DependenciesAnalysisResult {
  dependencies: DependencyItem[];
  issues: ScanIssue[];
}

export function analyzeDependencies(files: ProjectFileEntry[]): DependenciesAnalysisResult {
  const dependencies: DependencyItem[] = [];
  const issues: ScanIssue[] = [];

  for (const file of files) {
    const baseName = file.path.split(/[/\\]/).pop() || '';

    // 1. NPM package.json
    if (baseName === 'package.json') {
      try {
        const pkg = JSON.parse(file.content);
        const allDeps = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
        };

        for (const [depName, versionSpec] of Object.entries(allDeps)) {
          const versionStr = String(versionSpec).replace(/[\^~>=<]/g, '');
          const isDirect = !!pkg.dependencies?.[depName];

          // Check known vulnerabilities
          const vulns = KNOWN_CVE_DATABASE.filter((k) => k.name.toLowerCase() === depName.toLowerCase());

          const depItem: DependencyItem = {
            id: `npm-${depName}`,
            name: depName,
            currentVersion: versionStr || 'latest',
            ecosystem: 'npm',
            isDirect,
            isOutdated: versionStr.startsWith('0.') || versionStr.startsWith('1.'),
            license: depName.includes('gpl') ? 'GPL-3.0' : 'MIT',
            vulnerabilities: vulns.map((v) => ({
              cve: v.cve,
              severity: v.severity,
              title: v.title,
              fixedIn: v.fixedIn,
              description: v.description,
            })),
          };

          dependencies.push(depItem);

          for (const v of vulns) {
            issues.push({
              id: `dep-${v.cve}-${depName}`,
              ruleId: 'DEP-VULN-001',
              title: `Vulnerable Dependency: ${depName} (${v.cve})`,
              description: `${v.title} - Fixed in version ${v.fixedIn}.`,
              category: 'DEPENDENCY',
              severity: v.severity,
              cwe: 'CWE-1395',
              location: { filePath: file.path, startLine: 1, endLine: 1 },
              status: 'OPEN',
              createdAt: new Date().toISOString(),
            });
          }
        }
      } catch {
        // Ignore malformed JSON
      }
    }

    // 2. Python requirements.txt
    if (baseName === 'requirements.txt' || baseName === 'Pipfile') {
      const lines = file.content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const match = trimmed.match(/^([a-zA-Z0-9_\-.]+)(?:==|>=|<=|~=)?(.*)$/);
        if (match) {
          const depName = match[1];
          const version = match[2] || 'unknown';
          const vulns = KNOWN_CVE_DATABASE.filter((k) => k.name.toLowerCase() === depName.toLowerCase());

          dependencies.push({
            id: `pip-${depName}`,
            name: depName,
            currentVersion: version,
            ecosystem: 'pip',
            isDirect: true,
            isOutdated: false,
            vulnerabilities: vulns.map((v) => ({
              cve: v.cve,
              severity: v.severity,
              title: v.title,
              fixedIn: v.fixedIn,
              description: v.description,
            })),
          });

          for (const v of vulns) {
            issues.push({
              id: `dep-pip-${v.cve}-${depName}`,
              ruleId: 'DEP-VULN-001',
              title: `Vulnerable Python Package: ${depName} (${v.cve})`,
              description: `${v.title} - Recommended update to ${v.fixedIn}.`,
              category: 'DEPENDENCY',
              severity: v.severity,
              cwe: 'CWE-1395',
              location: { filePath: file.path, startLine: 1, endLine: 1 },
              status: 'OPEN',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    // 3. Go go.mod
    if (baseName === 'go.mod') {
      const lines = file.content.split(/\r?\n/);
      let inRequire = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('require (')) {
          inRequire = true;
          continue;
        }
        if (inRequire && trimmed === ')') {
          inRequire = false;
          continue;
        }
        if (inRequire || trimmed.startsWith('require ')) {
          const parts = trimmed.replace(/^require\s+/, '').split(/\s+/);
          if (parts[0]) {
            dependencies.push({
              id: `gomod-${parts[0]}`,
              name: parts[0],
              currentVersion: parts[1] || 'v1.0.0',
              ecosystem: 'gomod',
              isDirect: true,
              isOutdated: false,
              vulnerabilities: [],
            });
          }
        }
      }
    }
  }

  return { dependencies, issues };
}
