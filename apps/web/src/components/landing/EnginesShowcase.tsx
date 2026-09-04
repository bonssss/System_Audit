'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Zap,
  Layers,
  Flame,
  FileCode2,
  Cpu,
  Database,
  Network,
  TestTube2,
  BookOpen,
  Container,
  Boxes,
  Activity,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface EngineInfo {
  id: string;
  num: number;
  name: string;
  category: 'security' | 'quality' | 'infra' | 'architecture';
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  description: string;
  keyDetections: string[];
  benchmark: string;
  color: string;
}

const ENGINES: EngineInfo[] = [
  {
    id: 'project-footprint',
    num: 1,
    name: 'Project Footprint & Metrics',
    category: 'quality',
    categoryLabel: 'Code Quality',
    icon: FileCode2,
    headline: 'Multi-Language Token & LOC Profiling',
    description: 'Deep file tree analysis calculating exact physical lines, effective lines of code, comment density ratios, and multi-language breakdown.',
    keyDetections: ['Multi-language LOC breakdown', 'Comment-to-code ratio', 'Blank line normalization', 'File distribution tree'],
    benchmark: '< 15ms per 10k LOC',
    color: 'blue'
  },
  {
    id: 'code-smells',
    num: 2,
    name: 'Code Smells & Anti-Patterns',
    category: 'quality',
    categoryLabel: 'Code Quality',
    icon: Activity,
    headline: 'Structural AST Defect Detection',
    description: 'Inspects AST nodes for God classes, oversized methods (>50 lines), magic numbers, deep nesting, and dead unreachable code branches.',
    keyDetections: ['God classes & huge methods', 'Duplicate code tokens', 'Magic numbers in logic', 'Dead & unreachable code'],
    benchmark: 'Zero False Positives',
    color: 'amber'
  },
  {
    id: 'complexity',
    num: 3,
    name: 'Cognitive & Cyclomatic Engine',
    category: 'quality',
    categoryLabel: 'Code Quality',
    icon: Cpu,
    headline: 'Maintainability Index & Branch Scoring',
    description: 'Evaluates McCabe Cyclomatic Complexity alongside Sonar-style Cognitive Complexity, applying compounding penalties for nested logic.',
    keyDetections: ['Cognitive complexity nesting', 'McCabe cyclomatic score', 'Halstead volume metrics', 'Maintainability index (0-100)'],
    benchmark: 'AST-Level Accuracy',
    color: 'indigo'
  },
  {
    id: 'owasp-security',
    num: 4,
    name: 'OWASP Top 10 Security Engine',
    category: 'security',
    categoryLabel: 'Security & Secrets',
    icon: ShieldAlert,
    headline: 'Deterministic Vulnerability Identification',
    description: 'High-precision pattern matching and taint tracking for SQL injection, Command Injection, XSS, Path Traversal, SSRF, and Broken Auth.',
    keyDetections: ['SQLi & Command Injection', 'Cross-Site Scripting (XSS)', 'SSRF & Path Traversal', 'Insecure Deserialization'],
    benchmark: 'CWE / OWASP Aligned',
    color: 'rose'
  },
  {
    id: 'shannon-secrets',
    num: 5,
    name: 'Shannon Entropy Secret Scanner',
    category: 'security',
    categoryLabel: 'Security & Secrets',
    icon: KeyRound,
    headline: 'High-Entropy Credential Detection',
    description: 'Calculates character distribution randomness (bits/byte) combined with regex classifiers to detect leaked AWS, OpenAI, GitHub, and JWT keys.',
    keyDetections: ['AWS, GitHub, Stripe API keys', 'Private RSA / SSH keys', 'High-entropy JWT tokens', 'Plaintext database secrets'],
    benchmark: 'Shannon > 4.5 bits/char',
    color: 'purple'
  },
  {
    id: 'dependencies-cve',
    num: 6,
    name: 'Dependency SBOM & CVE Audit',
    category: 'security',
    categoryLabel: 'Security & Secrets',
    icon: Boxes,
    headline: 'Vulnerability Database Matching',
    description: 'Parses package.json, requirements.txt, and go.mod to extract Software Bill of Materials (SBOM) and match against known CVE advisories.',
    keyDetections: ['Known CVE advisory match', 'Permissive / Viral license audit', 'Outdated major dependencies', 'Transitive package risks'],
    benchmark: 'NVD / OSV Integrated',
    color: 'emerald'
  },
  {
    id: 'performance-profiler',
    num: 7,
    name: 'Performance & Loop Profiler',
    category: 'quality',
    categoryLabel: 'Performance & Code Health',
    icon: Flame,
    headline: 'Async Blocking & N+1 Anti-Pattern Guard',
    description: 'Identifies async operations trapped in sequential loops, unindexed large iterations, and synchronous blocking file I/O in server paths.',
    keyDetections: ['N+1 database queries in loops', 'Synchronous file I/O in requests', 'Unbounded memory collections', 'Redundant allocations'],
    benchmark: 'Microsecond Latency Detection',
    color: 'orange'
  },
  {
    id: 'architecture-coupling',
    num: 8,
    name: 'Architecture & Circular Graph',
    category: 'architecture',
    categoryLabel: 'Architecture & APIs',
    icon: Network,
    headline: 'Module Dependency & Layer Isolation',
    description: 'Constructs directed acyclic graphs (DAG) of your imports, detecting circular dependency cycles and violations of clean layering.',
    keyDetections: ['Circular dependency loops', 'Architectural layer bleed', 'High-afferent coupling', 'Isolated orphaned modules'],
    benchmark: 'Full Graph Visualization',
    color: 'cyan'
  },
  {
    id: 'api-surface',
    num: 9,
    name: 'API Surface & Auto OpenAPI',
    category: 'architecture',
    categoryLabel: 'Architecture & APIs',
    icon: Zap,
    headline: 'Endpoint Catalog & Spec Synthesizer',
    description: 'Discovers all REST and GraphQL route definitions across Next.js, Express, Fastify, and FastAPI, exporting compliant OpenAPI 3.0 specs.',
    keyDetections: ['Auto-extracted HTTP routes', 'Missing request validation', 'Unauthenticated public routes', 'OpenAPI 3.0 export ready'],
    benchmark: 'Instant Swagger / OpenAPI',
    color: 'teal'
  },
  {
    id: 'database-indexing',
    num: 10,
    name: 'Database & Schema Optimizer',
    category: 'architecture',
    categoryLabel: 'Architecture & APIs',
    icon: Database,
    headline: 'ORM & Foreign Key Optimization',
    description: 'Audits Prisma, TypeORM, and Mongoose schemas for missing relation indexes, polymorphic relations, and unindexed filter keys.',
    keyDetections: ['Missing foreign key indexes', 'Cascade delete risks', 'Unindexed high-cardinality cols', 'Schema naming inconsistencies'],
    benchmark: 'Prisma & SQL Native',
    color: 'blue'
  },
  {
    id: 'test-coverage',
    num: 11,
    name: 'Test Health & Mock Integrity',
    category: 'quality',
    categoryLabel: 'Performance & Code Health',
    icon: TestTube2,
    headline: 'Suite Ratio & Assertion Health',
    description: 'Analyzes test file ratios, detects skipped test blocks (.skip / .todo), and alerts on empty assertions or disabled test suites.',
    keyDetections: ['Test-to-source code ratio', 'Skipped (.skip / .only) tests', 'Empty assertion blocks', 'Untested critical handlers'],
    benchmark: 'Jest, Vitest, PyTest',
    color: 'green'
  },
  {
    id: 'doc-quality',
    num: 12,
    name: 'Documentation & Debt Tracker',
    category: 'quality',
    categoryLabel: 'Performance & Code Health',
    icon: BookOpen,
    headline: 'JSDoc & Tech Debt Marker Engine',
    description: 'Calculates docstring coverage on public APIs and scans for TODO, FIXME, HACK, and XXX markers with author and age tracking.',
    keyDetections: ['Public API docstring ratio', 'TODO / FIXME debt aggregation', 'README completeness score', 'Deprecated API annotations'],
    benchmark: 'Context-Aware Analysis',
    color: 'yellow'
  },
  {
    id: 'docker-hardening',
    num: 13,
    name: 'Docker Container Hardening',
    category: 'infra',
    categoryLabel: 'Infrastructure & Cloud',
    icon: Container,
    headline: 'Dockerfile Security & Layer Optimization',
    description: 'Audits Dockerfiles for root user execution, missing health checks, bloated base images, sensitive environment variables, and layer count.',
    keyDetections: ['Root USER container execution', 'Missing HEALTHCHECK commands', 'Secrets in build ENV args', 'Multi-stage build optimization'],
    benchmark: 'CIS Docker Benchmark',
    color: 'sky'
  },
  {
    id: 'k8s-guard',
    num: 14,
    name: 'Kubernetes Manifest Guard',
    category: 'infra',
    categoryLabel: 'Infrastructure & Cloud',
    icon: Layers,
    headline: 'Kube Security Context & Resource Limits',
    description: 'Scans YAML manifests for privileged pod execution, missing CPU/memory limits, hostPID/hostNetwork sharing, and writable root filesystems.',
    keyDetections: ['Privileged container flag', 'Missing resource limits (OOM)', 'Host namespace sharing', 'Writable root filesystem'],
    benchmark: 'NSA / CISA Hardening Guide',
    color: 'violet'
  }
];

export function EnginesShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredEngine, setHoveredEngine] = useState<string | null>(null);

  const filteredEngines = ENGINES.filter((engine) => {
    if (selectedCategory === 'all') return true;
    return engine.category === selectedCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'all', label: 'All 14 Engines (Comprehensive)' },
          { id: 'security', label: 'Security & Secrets (4)' },
          { id: 'quality', label: 'Code Quality & Complexity (5)' },
          { id: 'infra', label: 'Container & K8s Infra (2)' },
          { id: 'architecture', label: 'Architecture & Databases (3)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === tab.id
                ? 'bg-foreground text-background shadow-md scale-105'
                : 'bg-surface hover:bg-surface-hover text-muted-foreground border border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Engines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEngines.map((engine) => {
          const Icon = engine.icon;
          const isHovered = hoveredEngine === engine.id;

          return (
            <div
              key={engine.id}
              onMouseEnter={() => setHoveredEngine(engine.id)}
              onMouseLeave={() => setHoveredEngine(null)}
              className="relative p-5 rounded-2xl bg-surface border border-border hover:border-foreground/40 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              {/* Top Row: Engine Index & Category */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 text-foreground border border-border flex items-center justify-center font-bold group-hover:bg-foreground group-hover:text-background transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      Engine #{engine.num}
                    </span>
                  </div>
                </div>

                {/* Name & Headline */}
                <h4 className="text-sm font-bold text-foreground group-hover:text-foreground">
                  {engine.name}
                </h4>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5 mb-2.5">
                  {engine.headline}
                </p>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {engine.description}
                </p>
              </div>

              {/* Key Detections List */}
              <div className="pt-3 border-t border-border/60 space-y-1.5">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Rules & Audits:
                </div>
                {engine.keyDetections.map((detection, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-foreground/80">
                    <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{detection}</span>
                  </div>
                ))}

                <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Target:</span>
                  <span className="font-semibold text-foreground">{engine.benchmark}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
