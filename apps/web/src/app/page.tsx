'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Terminal, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  FileCode2, 
  Lock, 
  Boxes, 
  Flame, 
  Database, 
  Container, 
  KeyRound,
  FileText,
  FileSpreadsheet,
  Download,
  Github,
  Zap,
  Check
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { InteractiveScannerDemo } from '@/components/landing/InteractiveScannerDemo';
import { EnginesShowcase } from '@/components/landing/EnginesShowcase';
import { ArchitectureFlow } from '@/components/landing/ArchitectureFlow';
import { LandingComparison } from '@/components/landing/LandingComparison';
import { LandingFaq } from '@/components/landing/LandingFaq';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-black">
      {/* Sticky Top Navbar */}
      <LandingNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-border/40">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-emerald-500/10 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border shadow-sm text-xs text-muted-foreground font-medium animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-foreground">System Audit v2.4 Released</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-mono text-[11px]">14 AST Engines + Unified Diff AI</span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              Autonomous Code Audits.{' '}
              <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-300 dark:to-zinc-500 bg-clip-text text-transparent">
                Instant AI Patches.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade static analysis combining 14 specialized AST engines—from Shannon entropy secrets and OWASP Top 10 to Docker/K8s hardening—with autonomous unified diff remediations.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/scanner"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-foreground/10 group"
            >
              <Terminal className="w-4 h-4 group-hover:rotate-6 transition-transform" />
              <span>Launch Live Scanner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="#simulator"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-hover border border-border font-semibold text-sm text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Explore Interactive Demo</span>
            </a>
          </div>

          {/* Hero Metrics Pill Bar */}
          <div className="pt-8 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-3 bg-surface/50 rounded-xl border border-border">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-foreground">14</div>
              <div className="text-[11px] text-muted-foreground">Specialized Engines</div>
            </div>
            <div className="p-3 bg-surface/50 rounded-xl border border-border">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-foreground">&lt; 1.2s</div>
              <div className="text-[11px] text-muted-foreground">Scan Time / 50k LOC</div>
            </div>
            <div className="p-3 bg-surface/50 rounded-xl border border-border">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">99.4%</div>
              <div className="text-[11px] text-muted-foreground">AI Fix Accuracy</div>
            </div>
            <div className="p-3 bg-surface/50 rounded-xl border border-border">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-foreground">0 Byte</div>
              <div className="text-[11px] text-muted-foreground">Source Retention</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Scanner Playground Section */}
      <section id="simulator" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Code Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            See How System Audit Detects & Fixes Bugs In Real-Time
          </h2>
          <p className="text-sm text-muted-foreground">
            Select a vulnerability preset below or click &quot;Run Engine Scan&quot; to test our multi-engine tokenizer, entropy calculations, and unified diff synthesizer.
          </p>
        </div>

        <InteractiveScannerDemo />
      </section>

      {/* 14 Core Engines Matrix Section */}
      <section id="engines" className="py-20 border-t border-border/40 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Full-Stack Security Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              14 Specialized Scanning Engines
            </h2>
            <p className="text-sm text-muted-foreground">
              Every repository audit runs concurrently across 14 specialized static analysis and AST token engines, evaluating everything from code smells to container breakout vulnerabilities.
            </p>
          </div>

          <EnginesShowcase />
        </div>
      </section>

      {/* Architecture Pipeline Section */}
      <section id="architecture" className="py-20 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-500/20">
              <Cpu className="w-3.5 h-3.5" />
              <span>Under The Hood</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Monorepo AST & AI Orchestration Architecture
            </h2>
            <p className="text-sm text-muted-foreground">
              Built with Next.js 15, Tree-Sitter AST parsers, and Prisma ORM to deliver lightning-fast static analysis without heavy VM or JVM overhead.
            </p>
          </div>

          <ArchitectureFlow />
        </div>
      </section>

      {/* Comparison Matrix Section */}
      <section id="comparison" className="py-20 border-t border-border/40 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Why Engineers Choose System Audit</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              System Audit vs Legacy SAST & Linters
            </h2>
            <p className="text-sm text-muted-foreground">
              Don’t just get dumped with 500 unhelpful alert warnings. Get verified, context-aware unified diff patches ready to merge.
            </p>
          </div>

          <LandingComparison />
        </div>
      </section>

      {/* Multi-Format Export Showcase */}
      <section className="py-20 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/10 text-foreground text-xs font-semibold border border-border">
              <Download className="w-3.5 h-3.5" />
              <span>Export Anywhere</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Multi-Format Enterprise Reporting Center
            </h2>
            <p className="text-sm text-muted-foreground">
              Seamlessly share audit outcomes with engineers, DevOps teams, compliance auditors, and executive leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 hover:border-foreground/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <FileCode2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Interactive Standalone HTML</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Self-contained HTML package with embedded code viewer, search filters, and collapsible remediation drawers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 hover:border-foreground/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Executive Printable PDF</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                High-resolution formatted summary with executive letter grade, OWASP score breakdowns, and compliance certificates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 hover:border-foreground/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">SARIF v2.1.0 (CI/CD)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Standard OASIS SARIF format natively ingested by GitHub Code Scanning, GitLab SAST, and Azure DevOps pipelines.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 hover:border-foreground/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">CSV &amp; Jira Data Feed</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tabular spreadsheet export designed for bulk issue imports, Jira tracking, and sprint vulnerability triage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-border/40 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about System Audit, local LLM execution, and repository privacy.
            </p>
          </div>

          <LandingFaq />
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-foreground text-background p-8 sm:p-14 text-center space-y-6 overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 text-background text-xs font-semibold border border-background/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Zero Installation Required</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-background">
                Audit Your First Repository in Seconds
              </h2>
              <p className="text-xs sm:text-sm text-background/80 leading-relaxed">
                Upload a zip archive or connect a Git repository to generate a full 14-engine diagnostic report with ready-to-merge unified diff patches.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/scanner"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-background text-foreground font-bold text-sm hover:bg-background/90 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Terminal className="w-4 h-4" />
                <span>Start Free Scan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-background/10 hover:bg-background/20 text-background border border-background/20 font-semibold text-sm transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-12 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-foreground">System Audit Platform</div>
              <div className="text-[10px] text-muted-foreground font-mono">
                Commercial Static Analysis & AI Remediation
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#simulator" className="hover:text-foreground transition-colors">
              Sandbox
            </a>
            <a href="#engines" className="hover:text-foreground transition-colors">
              14 Engines
            </a>
            <a href="#architecture" className="hover:text-foreground transition-colors">
              Architecture
            </a>
            <Link href="/rules" className="hover:text-foreground transition-colors">
              Rule Catalog
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All Engines Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
