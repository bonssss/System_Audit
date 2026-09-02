import { ScanIssue } from '@ai-scanner/shared';

export interface SecretPattern {
  name: string;
  pattern: RegExp;
  minEntropy?: number;
  severity: 'CRITICAL' | 'HIGH';
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'AWS Access Key ID',
    pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
    severity: 'CRITICAL',
  },
  {
    name: 'AWS Secret Key',
    pattern: /(?:aws_secret_access_key|aws_sec_key|aws_secret)\s*[:=]\s*['"]([A-Za-z0-9/+=]{40})['"]/gi,
    severity: 'CRITICAL',
  },
  {
    name: 'Stripe API Key',
    pattern: /\b(sk_live_[0-9a-zA-Z]{24,99})\b/g,
    severity: 'CRITICAL',
  },
  {
    name: 'GitHub Personal Access Token',
    pattern: /\b(ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{82})\b/g,
    severity: 'CRITICAL',
  },
  {
    name: 'Slack Bot Token / Webhook',
    pattern: /\b(xoxb-[0-9]{11,13}-[0-9]{11,13}-[a-zA-Z0-9]{24}|https:\/\/hooks\.slack\.com\/services\/T[0-9A-Z]+\/B[0-9A-Z]+\/[0-9a-zA-Z]+)\b/g,
    severity: 'HIGH',
  },
  {
    name: 'Private Cryptographic Key',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
    severity: 'CRITICAL',
  },
  {
    name: 'Database Connection String with Credentials',
    pattern: /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^:\s]+:[^@\s]+@[a-zA-Z0-9.-]+:[0-9]+\/[a-zA-Z0-9_]+/gi,
    severity: 'CRITICAL',
  },
  {
    name: 'Hardcoded JWT Token',
    pattern: /\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+\b/g,
    severity: 'HIGH',
  },
  {
    name: 'Generic Hardcoded Password Assignment',
    pattern: /(?:password|passwd|secret|api_key|apikey|auth_token)\s*[:=]\s*['"]([^'"\s]{8,})['"]/gi,
    minEntropy: 3.2,
    severity: 'HIGH',
  },
];

export function calculateShannonEntropy(str: string): number {
  const map: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    map[c] = (map[c] || 0) + 1;
  }
  let entropy = 0;
  for (const c in map) {
    const p = map[c] / str.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function detectSecrets(content: string, filePath: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  // Skip binary/minified files, lock files, and documentation
  if (filePath.endsWith('.lock') || filePath.endsWith('.min.js') || filePath.endsWith('.map') || filePath.endsWith('.md')) {
    return issues;
  }

  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    for (const rule of SECRET_PATTERNS) {
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(line)) !== null) {
        const matchedValue = match[1] || match[0];
        
        // Skip placeholders like "YOUR_API_KEY", "CHANGEME", "password123"
        const lower = matchedValue.toLowerCase();
        if (
          lower.includes('placeholder') ||
          lower.includes('example') ||
          lower.includes('your_') ||
          lower.includes('<') ||
          lower.includes('$') ||
          lower.includes('process.env')
        ) {
          continue;
        }

        if (rule.minEntropy) {
          const entropy = calculateShannonEntropy(matchedValue);
          if (entropy < rule.minEntropy) {
            continue;
          }
        }

        const masked = matchedValue.length > 8 
          ? `${matchedValue.substring(0, 4)}...${matchedValue.substring(matchedValue.length - 3)}`
          : '********';

        issues.push({
          id: `sec-secret-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ruleId: 'SEC-SECRET-001',
          title: `Hardcoded Secret Detected: ${rule.name}`,
          description: `A potentially sensitive hardcoded secret (${rule.name}) was detected: \`${masked}\``,
          category: 'SECURITY',
          severity: rule.severity,
          cwe: 'CWE-798',
          owaspCategory: 'A07:2021-Identification and Authentication Failures',
          location: {
            filePath,
            startLine: lineNum,
            endLine: lineNum,
            snippet: line.trim(),
          },
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return issues;
}
