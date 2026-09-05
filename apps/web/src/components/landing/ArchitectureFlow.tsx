'use client';

import React from 'react';
import { 
  FolderGit2, 
  Cpu, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  Code2,
  Terminal,
  Lock
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Codebase Ingestion & AST Parsing',
    icon: FolderGit2,
    badge: 'Universal Ingestion',
    description: 'Zip archive upload or automated Git webhook sync. Tokenizes source into abstract syntax trees across TS, JS, Python, Go, Java, Docker, and K8s.',
    techs: ['Babel / TS Parser', 'Tree-Sitter Tokenizer', 'In-Memory Stream']
  },
  {
    step: '02',
    title: '14 Core Static & Entropy Engines',
    icon: Cpu,
    badge: 'Zero-Overhead Analysis',
    description: 'Parallel execution across 14 deterministic engines: OWASP Top 10, Shannon secret entropy, cognitive branch penalties, N+1 query loop detection.',
    techs: ['Shannon Entropy (H)', 'McCabe Cyclomatic', 'CWE / CVE Matcher']
  },
  {
    step: '03',
    title: 'Autonomous AI Patch Synthesizer',
    icon: Sparkles,
    badge: 'Unified Diff Generation',
    description: 'Multi-LLM orchestrator (OpenAI, Gemini, Anthropic, local Ollama) analyzes findings in context and produces verifiable before/after unified diff patches.',
    techs: ['Context Windowing', 'AST Verification', 'Confidence Scoring']
  },
  {
    step: '04',
    title: 'SARIF, HTML & Executive Export',
    icon: FileText,
    badge: 'Multi-Format Delivery',
    description: 'Generates GitHub-compliant SARIF for automated CI/CD gating, interactive standalone HTML for dev teams, and executive printable PDFs.',
    techs: ['SARIF v2.1.0', 'Self-Contained HTML', 'Printable PDF / CSV']
  }
];

export function ArchitectureFlow() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      {/* Visual Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.step}
              className="relative p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4 hover:border-foreground/30 transition-all duration-200 group"
            >
              {/* Step Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-2xl font-black text-muted-foreground/30 group-hover:text-foreground/30 transition-colors">
                    {step.step}
                  </span>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-semibold">
                  {step.badge}
                </span>

                <h4 className="text-base font-bold text-foreground mt-2 mb-2">
                  {step.title}
                </h4>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Technologies List */}
              <div className="pt-4 border-t border-border/60">
                <div className="flex flex-wrap gap-1.5">
                  {step.techs.map((t, tIdx) => (
                    <span 
                      key={tIdx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-hover text-foreground/80 border border-border/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Local-First Callout Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-surface border border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
              Privacy First & Air-Gapped Ready
            </span>
          </div>
          <h4 className="text-lg font-bold text-foreground">
            Zero Code Retention & 100% On-Premise / Local LLM Execution
          </h4>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Your source code is tokenized in ephemeral worker memory. For strict compliance environments, connect System Audit to local Ollama or vLLM instances without sending bytes outside your perimeter.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <a
            href="/rules"
            className="w-full sm:w-auto text-center px-4 py-2.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover border border-border text-foreground transition-colors"
          >
            Explore 100+ Rules
          </a>
          <a
            href="/scanner"
            className="w-full sm:w-auto text-center px-4 py-2.5 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Test Local Scan
          </a>
        </div>
      </div>
    </div>
  );
}
