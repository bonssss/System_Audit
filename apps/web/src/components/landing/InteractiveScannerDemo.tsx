'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight,
  Code2,
  FileCode2,
  Cpu,
  Zap,
  Flame,
  KeyRound,
  Database,
  Container
} from 'lucide-react';

interface PresetSnippet {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  filename: string;
  language: string;
  code: string;
  fixedCode: string;
  finding: {
    ruleId: string;
    title: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    cwe: string;
    line: number;
    explanation: string;
    aiRemediation: string;
  };
  diff: string[];
}

const PRESETS: PresetSnippet[] = [
  {
    id: 'sqli',
    name: 'Raw SQL Injection',
    category: 'OWASP A03',
    icon: Database,
    filename: 'src/api/users.ts',
    language: 'typescript',
    code: `import { prisma } from '@/lib/db';

export async function getUserOrders(userId: string) {
  // ⚠️ CRITICAL: Raw concatenation in query execution
  const query = "SELECT * FROM orders WHERE user_id = '" + userId + "' ORDER BY created_at DESC";
  return await prisma.$queryRawUnsafe(query);
}`,
    fixedCode: `import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function getUserOrders(userId: string) {
  // ✅ REMEDIATED: Parameterized SQL template prevents SQLi
  return await prisma.$queryRaw\`
    SELECT * FROM orders 
    WHERE user_id = \${userId} 
    ORDER BY created_at DESC
  \`;
}`,
    finding: {
      ruleId: 'SEC-OWASP-SQLI-001',
      title: 'Unsanitized Dynamic SQL Concatenation ($queryRawUnsafe)',
      severity: 'CRITICAL',
      cwe: 'CWE-89: SQL Injection',
      line: 5,
      explanation: 'User-controlled input userId is concatenated directly into a raw SQL query string without escaping or parameter binding, allowing arbitrary SQL execution.',
      aiRemediation: 'Refactored to use Prisma parameterized template literal ($queryRaw), which automatically escapes all embedded expressions and parameterizes the SQL statement.',
    },
    diff: [
      "-  const query = \"SELECT * FROM orders WHERE user_id = '\" + userId + \"' ORDER BY created_at DESC\";",
      "-  return await prisma.$queryRawUnsafe(query);",
      "+  return await prisma.$queryRaw`",
      "+    SELECT * FROM orders ",
      "+    WHERE user_id = ${userId} ",
      "+    ORDER BY created_at DESC",
      "+  `;",
    ]
  },
  {
    id: 'shannon-secret',
    name: 'Shannon Secret Leak',
    category: 'Entropy Engine',
    icon: KeyRound,
    filename: 'src/services/aws.ts',
    language: 'typescript',
    code: `// Cloud storage client configuration
export const AWS_CONFIG = {
  region: 'us-east-1',
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  // ⚠️ CRITICAL: High-entropy secret token committed to source
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  bucket: 'prod-user-vault'
};`,
    fixedCode: `// Cloud storage client configuration
export const AWS_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  // ✅ REMEDIATED: Loaded securely from runtime environment
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  bucket: process.env.AWS_S3_BUCKET || 'prod-user-vault'
};`,
    finding: {
      ruleId: 'SEC-ENTROPY-AWS-KEY-002',
      title: 'High-Entropy Secret Key Exposed in Plaintext (Entropy: 4.82 bits/byte)',
      severity: 'CRITICAL',
      cwe: 'CWE-798: Use of Hard-coded Credentials',
      line: 6,
      explanation: 'Shannon entropy analysis detected a 40-character base64 credential pattern exceeding the 4.5 bit randomness threshold.',
      aiRemediation: 'Replaced hardcoded API secret with typed process.env environment variables and added fallback configurations.',
    },
    diff: [
      "-  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',",
      "-  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',",
      "+  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,",
      "+  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,",
    ]
  },
  {
    id: 'n-plus-one',
    name: 'N+1 Query Bottleneck',
    category: 'Performance',
    icon: Flame,
    filename: 'src/services/reports.ts',
    language: 'typescript',
    code: `export async function getProjectsWithAuditLogs(projects: Project[]) {
  const results = [];
  // ⚠️ HIGH: N+1 database queries inside sequential iteration
  for (const proj of projects) {
    const logs = await db.auditLogs.findMany({ where: { projId: proj.id } });
    results.push({ ...proj, logs });
  }
  return results;
}`,
    fixedCode: `export async function getProjectsWithAuditLogs(projects: Project[]) {
  // ✅ REMEDIATED: Batch query with 'in' filter reduces N queries to 1
  const projectIds = projects.map(p => p.id);
  const allLogs = await db.auditLogs.findMany({
    where: { projId: { in: projectIds } }
  });
  
  const logsByProject = Map.groupBy(allLogs, (log) => log.projId);
  return projects.map(proj => ({ ...proj, logs: logsByProject.get(proj.id) || [] }));
}`,
    finding: {
      ruleId: 'PERF-ASYNC-NPLUS1-003',
      title: 'Blocking N+1 Database Execution in Sequential Loop',
      severity: 'HIGH',
      cwe: 'CWE-400: Uncontrolled Resource Consumption',
      line: 5,
      explanation: 'Sequential await db call inside for-of loop induces O(N) database round-trips causing high latency spikes under production volume.',
      aiRemediation: 'Rewritten into a single batch WHERE IN query with in-memory Map.groupBy aggregation, reducing latency from O(N) to O(1) network hops.',
    },
    diff: [
      "-  for (const proj of projects) {",
      "-    const logs = await db.auditLogs.findMany({ where: { projId: proj.id } });",
      "-    results.push({ ...proj, logs });",
      "-  }",
      "+  const projectIds = projects.map(p => p.id);",
      "+  const allLogs = await db.auditLogs.findMany({ where: { projId: { in: projectIds } } });",
      "+  const logsByProject = Map.groupBy(allLogs, l => l.projId);",
    ]
  },
  {
    id: 'docker-security',
    name: 'Docker Root Execution',
    category: 'Container Hardening',
    icon: Container,
    filename: 'Dockerfile',
    language: 'dockerfile',
    code: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# ⚠️ HIGH: Missing non-root user & exposed socket
EXPOSE 3000
CMD ["npm", "start"]`,
    fixedCode: `FROM node:20-alpine AS runner
WORKDIR /app
# ✅ REMEDIATED: Least privilege non-root execution
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs
COPY --chown=nextjs:nodejs . .
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["npm", "start"]`,
    finding: {
      ruleId: 'DOCKER-SECURITY-ROOT-004',
      title: 'Container Process Running as Privileged Root User',
      severity: 'HIGH',
      cwe: 'CWE-250: Execution with Unnecessary Privileges',
      line: 8,
      explanation: 'Default root execution in containers allows potential container breakout and host file manipulation if runtime vulnerability is triggered.',
      aiRemediation: 'Added dedicated non-root nextjs user/group with --chown permissions and Docker health check command.',
    },
    diff: [
      "+RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs",
      "-COPY . .",
      "+COPY --chown=nextjs:nodejs . .",
      "+USER nextjs",
      "+HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1",
    ]
  }
];

export function InteractiveScannerDemo() {
  const [selectedPreset, setSelectedPreset] = useState<PresetSnippet>(PRESETS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(3); // 0=idle, 1=ast, 2=entropy, 3=done
  const [appliedFix, setAppliedFix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'diff' | 'ast'>('code');

  const handleSelectPreset = (preset: PresetSnippet) => {
    setSelectedPreset(preset);
    setAppliedFix(false);
    setScanStep(3);
    setActiveTab('code');
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setScanStep(1);
    setAppliedFix(false);

    setTimeout(() => {
      setScanStep(2);
    }, 600);

    setTimeout(() => {
      setScanStep(3);
      setIsScanning(false);
    }, 1200);
  };

  const handleApplyFix = () => {
    setAppliedFix(true);
  };

  const handleRevertFix = () => {
    setAppliedFix(false);
  };

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(selectedPreset.diff.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden transition-colors">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-border bg-muted/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wide uppercase text-muted-foreground font-mono">
              Live AST & AI Remediation Sandbox
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground mt-0.5">
            Test Real-Time Vulnerability Detection & Autonomous Diff Synthesis
          </h3>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-surface hover:bg-surface-hover text-muted-foreground border border-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left Column: Code Editor & AST View (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-background/50">
          {/* Editor Sub-Header */}
          <div className="h-10 px-4 border-b border-border flex items-center justify-between bg-surface/50 text-xs">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono text-[11px] text-foreground font-medium">
                {selectedPreset.filename}
              </span>
              {appliedFix && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-medium border border-emerald-500/20">
                  Fixed
                </span>
              )}
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'code'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Source
              </button>
              <button
                onClick={() => setActiveTab('diff')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'diff'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                AI Diff
              </button>
              <button
                onClick={() => setActiveTab('ast')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'ast'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                AST Telemetry
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="p-4 flex-1 font-mono text-xs overflow-x-auto min-h-[260px] bg-zinc-950 text-zinc-100 dark:bg-black select-text">
            {activeTab === 'code' && (
              <pre className="leading-relaxed">
                <code>
                  {(appliedFix ? selectedPreset.fixedCode : selectedPreset.code)
                    .split('\n')
                    .map((line, idx) => (
                      <div key={idx} className="flex">
                        <span className="w-8 select-none text-zinc-600 text-right pr-4 text-[11px]">
                          {idx + 1}
                        </span>
                        <span className={
                          line.includes('⚠️') 
                            ? 'text-rose-400 bg-rose-950/40 px-1 rounded' 
                            : line.includes('✅') 
                              ? 'text-emerald-400 bg-emerald-950/40 px-1 rounded' 
                              : ''
                        }>
                          {line}
                        </span>
                      </div>
                    ))}
                </code>
              </pre>
            )}

            {activeTab === 'diff' && (
              <div className="space-y-1">
                <div className="text-[11px] text-zinc-500 pb-2 border-b border-zinc-800 flex items-center justify-between">
                  <span>--- a/{selectedPreset.filename}</span>
                  <span>+++ b/{selectedPreset.filename}</span>
                </div>
                {selectedPreset.diff.map((line, idx) => (
                  <div 
                    key={idx} 
                    className={`py-0.5 px-2 rounded text-[11px] ${
                      line.startsWith('-') 
                        ? 'bg-rose-950/50 text-rose-300 border-l-2 border-rose-500' 
                        : 'bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500'
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'ast' && (
              <div className="space-y-2 text-[11px] text-zinc-300 font-mono">
                <div className="text-zinc-500 uppercase text-[10px] tracking-wider">Engine Tokenizer Metrics</div>
                <div className="grid grid-cols-2 gap-2 text-zinc-400">
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="block text-zinc-500 text-[10px]">AST Node Count</span>
                    <span className="text-zinc-100 font-bold text-sm">48 Nodes</span>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="block text-zinc-500 text-[10px]">Cognitive Penalty</span>
                    <span className="text-amber-400 font-bold text-sm">Level 4 (Looping)</span>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="block text-zinc-500 text-[10px]">Entropy Metric</span>
                    <span className="text-rose-400 font-bold text-sm">4.82 bits / byte</span>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="block text-zinc-500 text-[10px]">Parser Latency</span>
                    <span className="text-emerald-400 font-bold text-sm">0.84 ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-3 border-t border-border bg-surface/70 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
              >
                {isScanning ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing AST...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Engine Scan</span>
                  </>
                )}
              </button>

              {appliedFix ? (
                <button
                  onClick={handleRevertFix}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface border border-border"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Revert to Vulnerable</span>
                </button>
              ) : (
                <button
                  onClick={handleApplyFix}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply AI Patch</span>
                </button>
              )}
            </div>

            <button
              onClick={handleCopyDiff}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Diff Copied' : 'Copy Diff'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Real-Time Diagnostic & Remediation Cards (5 Cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-surface">
          {/* Risk Grade & Overview */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                  Engine Diagnosis
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  {appliedFix ? 'Security Score: Clean' : 'Security Score: Violation'}
                </h4>
              </div>

              <div className={`px-3 py-1 rounded-xl font-bold font-mono text-sm border flex items-center gap-1.5 ${
                appliedFix
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}>
                {appliedFix ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                <span>{appliedFix ? 'Grade A+' : 'Grade F'}</span>
              </div>
            </div>

            {/* Finding Card */}
            {appliedFix ? (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No Security or Performance Smells Detected</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AST validator confirmed parameterized inputs, non-root execution guidelines, and high-entropy secret isolation.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>14 engines passed with 0 findings</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-xl bg-background border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {selectedPreset.finding.severity}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Line {selectedPreset.finding.line}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-foreground">
                    {selectedPreset.finding.title}
                  </h5>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {selectedPreset.finding.explanation}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-muted-foreground border-t border-border/50">
                    <span>{selectedPreset.finding.ruleId}</span>
                    <span>{selectedPreset.finding.cwe}</span>
                  </div>
                </div>

                {/* AI Explanation Box */}
                <div className="p-3.5 rounded-xl bg-foreground/5 border border-border space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Autonomous AI Remediation Synthesizer</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {selectedPreset.finding.aiRemediation}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Confidence: 99.4%</span>
                    <span>•</span>
                    <span>Ready for 1-Click Pull Request</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Scanner Capabilities CTA */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              Ready to scan your codebase?
            </span>
            <a
              href="/scanner"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:underline"
            >
              <span>Full Repository Scan</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
