'use client';

import React from 'react';
import { Check, X, Sparkles, ShieldCheck } from 'lucide-react';

const COMPARISON_ROWS = [
  {
    feature: 'AI Unified Diff Remediation (1-Click Fix)',
    auditAi: true,
    sonar: false,
    snyk: false,
    linters: false,
    note: 'Context-aware synthesized code patches with confidence scoring'
  },
  {
    feature: '14 Multi-Domain Engines in One Scan',
    auditAi: true,
    sonar: false,
    snyk: false,
    linters: false,
    note: 'OWASP, Secrets, Complexity, K8s, Docker, N+1, DB, and OpenAPI'
  },
  {
    feature: 'Shannon Entropy Secret Detection',
    auditAi: true,
    sonar: false,
    snyk: true,
    linters: false,
    note: 'Mathematical randomness evaluation for zero false-positive credentials'
  },
  {
    feature: 'Docker & Kubernetes Manifest Hardening',
    auditAi: true,
    sonar: false,
    snyk: true,
    linters: false,
    note: 'Root user, capabilities, and resource limit compliance'
  },
  {
    feature: 'Database ORM & N+1 Query Anti-Pattern Audit',
    auditAi: true,
    sonar: false,
    snyk: false,
    linters: false,
    note: 'Detects sequential await loops & missing foreign key indexes'
  },
  {
    feature: 'Standalone Portable HTML & Printable PDF Export',
    auditAi: true,
    sonar: false,
    snyk: false,
    linters: false,
    note: 'Self-contained interactive reports for clients and leadership'
  },
  {
    feature: 'Air-Gapped Local LLM Execution (Ollama / vLLM)',
    auditAi: true,
    sonar: false,
    snyk: false,
    linters: true,
    note: '100% private processing with zero telemetry'
  },
  {
    feature: 'Standard SARIF v2.1.0 CI/CD Integration',
    auditAi: true,
    sonar: true,
    snyk: true,
    linters: true,
    note: 'Directly compatible with GitHub Code Scanning alerts'
  }
];

export function LandingComparison() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="overflow-x-auto rounded-2xl bg-surface border border-border shadow-xl">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Platform Capability
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-foreground font-mono bg-foreground/5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AuditAI (Pro)</span>
                </div>
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono text-center">
                SonarQube
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono text-center">
                Snyk / SAST
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono text-center">
                Basic Linters
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {COMPARISON_ROWS.map((row, idx) => (
              <tr 
                key={idx} 
                className="hover:bg-surface-hover transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="font-semibold text-foreground">{row.feature}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{row.note}</div>
                </td>
                <td className="py-4 px-6 text-center bg-foreground/5 font-semibold">
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  {row.sonar ? (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground">
                      <X className="w-3.5 h-3.5" />
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  {row.snyk ? (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground">
                      <X className="w-3.5 h-3.5" />
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  {row.linters ? (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground">
                      <X className="w-3.5 h-3.5" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
