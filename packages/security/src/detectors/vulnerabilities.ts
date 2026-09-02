import { ScanIssue, Severity } from '@ai-scanner/shared';

interface VulnRule {
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  cwe: string;
  owaspCategory: string;
  description: string;
  pattern: RegExp;
  applicableExtensions: string[];
}

const VULN_RULES: VulnRule[] = [
  // --- SQL INJECTION ---
  {
    id: 'sqli-concatenation',
    ruleId: 'SEC-SQLI-001',
    title: 'Potential SQL Injection via String Concatenation',
    severity: 'CRITICAL',
    cwe: 'CWE-89',
    owaspCategory: 'A03:2021-Injection',
    description: 'Dynamic SQL query constructed using string concatenation or template literal with unescaped variables.',
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s+.*(?:\+\s*[a-zA-Z_$]|\$\{[a-zA-Z_$]|\.format\(|%\s*\([a-zA-Z_$])/i,
    applicableExtensions: ['.ts', '.js', '.py', '.java', '.php', '.cs', '.go', '.rb'],
  },
  {
    id: 'sqli-raw-orm',
    ruleId: 'SEC-SQLI-001',
    title: 'Unescaped Raw SQL in ORM Execution',
    severity: 'HIGH',
    cwe: 'CWE-89',
    owaspCategory: 'A03:2021-Injection',
    description: 'Raw SQL executed through ORM/query builder ($queryRawUnsafe, rawQuery, raw()) with dynamic user input.',
    pattern: /\b(\$queryRawUnsafe|rawQuery|sequelize\.query\s*\([^,)]+\+|\.raw\s*\([^,)]+\+)/,
    applicableExtensions: ['.ts', '.js', '.py', '.php'],
  },

  // --- CROSS-SITE SCRIPTING (XSS) ---
  {
    id: 'xss-dangerously-set-inner-html',
    ruleId: 'SEC-XSS-001',
    title: 'React dangerouslySetInnerHTML Used Without Sanitization',
    severity: 'HIGH',
    cwe: 'CWE-79',
    owaspCategory: 'A03:2021-Injection',
    description: 'Rendering raw HTML using dangerouslySetInnerHTML exposes the client to Cross-Site Scripting.',
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/,
    applicableExtensions: ['.tsx', '.jsx', '.ts', '.js'],
  },
  {
    id: 'xss-inner-html',
    ruleId: 'SEC-XSS-001',
    title: 'Direct DOM innerHTML Assignment',
    severity: 'HIGH',
    cwe: 'CWE-79',
    owaspCategory: 'A03:2021-Injection',
    description: 'Assigning unescaped data directly to innerHTML can execute arbitrary scripts in the browser.',
    pattern: /\b(?:element|\$|document(?:\.[a-zA-Z0-9_$]+)?)\.innerHTML\s*=/,
    applicableExtensions: ['.ts', '.js', '.html'],
  },
  {
    id: 'xss-vue-v-html',
    ruleId: 'SEC-XSS-001',
    title: 'Vue v-html Directive Used on Untrusted Content',
    severity: 'HIGH',
    cwe: 'CWE-79',
    owaspCategory: 'A03:2021-Injection',
    description: 'Binding dynamic HTML in Vue templates with v-html creates an XSS attack vector.',
    pattern: /v-html\s*=\s*["'][^"']+["']/,
    applicableExtensions: ['.vue', '.html', '.js'],
  },

  // --- COMMAND INJECTION ---
  {
    id: 'cmd-injection-exec',
    ruleId: 'SEC-CMDI-001',
    title: 'Potential Command Injection via Shell Execution',
    severity: 'CRITICAL',
    cwe: 'CWE-78',
    owaspCategory: 'A03:2021-Injection',
    description: 'Passing dynamic strings into shell execution functions (exec, system, shell_exec, subprocess with shell=True).',
    pattern: /\b(child_process\.exec\s*\(|execSync\s*\(|os\.system\s*\(|subprocess\.Popen\s*\([^)]*shell\s*=\s*True|shell_exec\s*\(|Runtime\.getRuntime\(\)\.exec\s*\()/,
    applicableExtensions: ['.ts', '.js', '.py', '.php', '.java', '.cs', '.go'],
  },
  {
    id: 'cmd-eval',
    ruleId: 'SEC-CMDI-001',
    title: 'Dangerous Use of Dynamic Code Evaluation (eval)',
    severity: 'CRITICAL',
    cwe: 'CWE-95',
    owaspCategory: 'A03:2021-Injection',
    description: 'Dynamic code execution via eval() or Function constructor allows arbitrary code execution.',
    pattern: /\b(eval\s*\(|new\s+Function\s*\([^)]*\)\s*\()/,
    applicableExtensions: ['.ts', '.js', '.py', '.php'],
  },

  // --- SSRF ---
  {
    id: 'ssrf-unvalidated-url',
    ruleId: 'SEC-SSRF-001',
    title: 'Server-Side Request Forgery (SSRF) Risk',
    severity: 'HIGH',
    cwe: 'CWE-918',
    owaspCategory: 'A10:2021-Server-Side Request Forgery',
    description: 'Outbound HTTP request executed with dynamic target URL directly from request query/body.',
    pattern: /(?:axios|fetch|http\.get|requests\.get|urllib\.request\.urlopen)\s*\(\s*(?:req\.query|req\.body|request\.args|request\.POST|url_param)/,
    applicableExtensions: ['.ts', '.js', '.py', '.java', '.go', '.php'],
  },

  // --- PATH TRAVERSAL ---
  {
    id: 'path-traversal-fs',
    ruleId: 'SEC-PATH-001',
    title: 'Potential Path Traversal in File Operations',
    severity: 'HIGH',
    cwe: 'CWE-22',
    owaspCategory: 'A01:2021-Broken Access Control',
    description: 'File reading or writing with un-sanitized relative path concatenation.',
    pattern: /(?:readFile|readFileSync|createReadStream|open|FileInputStream)\s*\([^)]*(?:req\.params|req\.query|\+.*(?:\.\.\/|\.\.\\))/,
    applicableExtensions: ['.ts', '.js', '.py', '.java', '.php', '.cs'],
  },

  // --- UNSAFE DESERIALIZATION ---
  {
    id: 'deser-pickle',
    ruleId: 'SEC-DESER-001',
    title: 'Insecure Deserialization via Python Pickle',
    severity: 'CRITICAL',
    cwe: 'CWE-502',
    owaspCategory: 'A08:2021-Software and Data Integrity Failures',
    description: 'pickle.loads() can execute arbitrary Python bytecode upon deserialization.',
    pattern: /\bpickle\.loads?\s*\(/,
    applicableExtensions: ['.py'],
  },
  {
    id: 'deser-yaml-load',
    ruleId: 'SEC-DESER-001',
    title: 'Unsafe YAML Loading (YAML Deserialization RCE)',
    severity: 'HIGH',
    cwe: 'CWE-502',
    owaspCategory: 'A08:2021-Software and Data Integrity Failures',
    description: 'yaml.load() without SafeLoader allows instantiation of arbitrary Python classes.',
    pattern: /\byaml\.load\s*\([^,)]*\)(?!\s*,\s*Loader\s*=\s*(?:yaml\.)?SafeLoader)/,
    applicableExtensions: ['.py'],
  },

  // --- WEAK CRYPTOGRAPHY ---
  {
    id: 'crypto-weak-hash',
    ruleId: 'SEC-CRYPTO-001',
    title: 'Use of Insecure Hash Algorithm (MD5/SHA1)',
    severity: 'MEDIUM',
    cwe: 'CWE-327',
    owaspCategory: 'A02:2021-Cryptographic Failures',
    description: 'MD5 and SHA-1 hashes are cryptographically broken and prone to collision attacks.',
    pattern: /(?:createHash\s*\(\s*['"](?:md5|sha1)['"]|hashlib\.(?:md5|sha1)\s*\(|MessageDigest\.getInstance\s*\(\s*["'](?:MD5|SHA-1)["']\))/i,
    applicableExtensions: ['.ts', '.js', '.py', '.java', '.cs', '.php', '.go'],
  },
  {
    id: 'crypto-insecure-random',
    ruleId: 'SEC-CRYPTO-001',
    title: 'Pseudo-Random Number Generator Used in Security Context',
    severity: 'LOW',
    cwe: 'CWE-338',
    owaspCategory: 'A02:2021-Cryptographic Failures',
    description: 'Math.random() or random.random() is predictable and must not be used for tokens, salts, or passwords.',
    pattern: /(?:token|secret|salt|key|auth|nonce|session)\s*[:=][^;\n]*(?:Math\.random\(\)|random\.random\(\)|random\.randint\()/i,
    applicableExtensions: ['.ts', '.js', '.py', '.java', '.cs', '.php'],
  },

  // --- MISCONFIGURED CORS ---
  {
    id: 'cors-wildcard-origin',
    ruleId: 'SEC-CORS-001',
    title: 'Permissive CORS Configuration (Wildcard Origin)',
    severity: 'MEDIUM',
    cwe: 'CWE-942',
    owaspCategory: 'A05:2021-Security Misconfiguration',
    description: 'Access-Control-Allow-Origin header set to wildcard `*` alongside credentials allows cross-origin data leakage.',
    pattern: /(?:Access-Control-Allow-Origin\s*[:=]\s*['"]\*['"]|origin:\s*['"]\*['"]|cors\(\s*\{\s*origin:\s*true\s*\}\))/,
    applicableExtensions: ['.ts', '.js', '.py', '.java', '.php', '.json', '.yaml'],
  },
];

export function detectVulnerabilities(content: string, filePath: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const dotIdx = filePath.lastIndexOf('.');
  const ext = dotIdx !== -1 ? filePath.substring(dotIdx).toLowerCase() : '';
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    for (const rule of VULN_RULES) {
      if (!rule.applicableExtensions.includes(ext)) {
        continue;
      }

      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(line)) {
        issues.push({
          id: `sec-${rule.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ruleId: rule.ruleId,
          title: rule.title,
          description: rule.description,
          category: 'SECURITY',
          severity: rule.severity,
          cwe: rule.cwe,
          owaspCategory: rule.owaspCategory,
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
