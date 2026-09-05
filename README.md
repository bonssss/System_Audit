# System Audit

> Enterprise-grade, multi-language static code analysis, security auditing, and AI-powered remediation platform built with Next.js 15, TypeScript, and Prisma ORM.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Overview

**System Audit** is a commercial-grade SaaS code auditing platform combining static code analysis (similar to SonarQube + Snyk + DeepSource + GitHub Code Scanning) with automated **AI-powered unified diff remediations**.

Users can upload source code archives (`.zip`) or connect Git repositories to analyze their entire codebase across **14 specialized scanning modules**, producing executive health ratings (A+ to F), risk diagnostics, architecture graphs, and compliance reports.

---

## ⚡ Key Features

### 🔍 14 Comprehensive Scanning Engines
1. **Project Statistics & Footprint**: Multi-language lines of code (LOC), comments ratio, blank lines, and file distribution.
2. **Code Quality & Code Smells**: God classes, long methods, magic numbers, duplicate code blocks, and dead code instances.
3. **Complexity & Maintainability**: Cyclomatic complexity, Cognitive complexity with nesting penalties, and Halstead/Coleman-Liau Maintainability Index.
4. **Security & OWASP Top 10**: Injection (SQLi, Command), Cross-Site Scripting (XSS), Broken Authentication, SSRF, Path Traversal, Insecure Deserialization, and Weak Cryptography.
5. **Shannon Secret Detection**: High-entropy secret analysis detecting leaked API keys, tokens, private keys, and JWTs.
6. **Dependency Vulnerability & License Audit**: SBOM extraction matching dependencies against known CVE databases with license compatibility analysis.
7. **Performance & Resource Bottlenecks**: N+1 query loop detection, nested blocking loops, and synchronous file I/O anti-patterns.
8. **Architecture & Coupling**: Module dependency graph, circular dependency loop detection, and architectural layer isolation checks.
9. **API Surface & OpenAPI Generation**: Auto-extraction of REST and GraphQL endpoints with automatic OpenAPI 3.0 specification export.
10. **Database & Indexing Optimization**: ORM model analysis, missing foreign key indexes, and unindexed filter audits.
11. **Test Suite Coverage & Quality**: Test-to-code ratio, skipped/disabled test assertions, and test structure health.
12. **Documentation Quality**: README completeness score, inline JSDoc/docstring coverage, and tech debt marker tracker (`TODO`/`FIXME`).
13. **Docker Container Hardening**: Root user execution, missing health checks, bloated base images, and secret layer leakage.
14. **Kubernetes Manifest Security**: Privileged pod execution, missing resource limits, host namespace sharing, and insecure capabilities.

---

### 🤖 AI Remediation Engine
- **Root Cause Analysis**: Contextual explanation of why the vulnerability exists.
- **Business & Operational Impact**: Real-world exploit risk assessment.
- **Unified Diff Patches**: Synthesized before/after code patches with confidence scores, ready for 1-click copy.
- **Multi-Model Support**: Integrated with OpenAI, Anthropic, Google Gemini, Ollama (local LLMs), and local deterministic rules.

---

### 📑 Multi-Format Export Center
- **Interactive Standalone HTML**: Self-contained client report with collapsible finding details.
- **Executive Printable PDF**: Formatted summary report for leadership and compliance reviews.
- **Machine-Readable JSON / SARIF**: Compatible with GitHub Code Scanning and automated CI/CD pipelines.
- **CSV Spreadsheet**: Tabular issue list for Jira and issue tracker imports.

---

## 🏗️ Monorepo Architecture

```
system_audit/
├── apps/
│   └── web/                    # Next.js 15 App Router platform with Tailwind CSS
│       ├── prisma/             # Prisma schema & migration definitions
│       └── src/
│           ├── app/            # App Router pages & API routes
│           ├── components/     # UI components, Recharts widgets, CodeViewer
│           └── lib/            # Scanner service, auth, storage, database
├── packages/
│   ├── shared/                 # DTOs, schemas, rule catalog, and scoring algorithms
│   ├── parser/                 # Line tokenizers, AST extractors, complexity metrics
│   ├── security/               # OWASP detectors, Shannon entropy secret scanner
│   ├── scanner-core/           # 14-engine orchestrator and progress emitter
│   ├── ai/                     # AI remediation engine & unified diff synthesizer
│   └── reports/                # HTML, PDF, JSON, and CSV report generators
├── Dockerfile                  # Production multi-stage Docker build
├── docker-compose.yml          # Web + PostgreSQL 16 + Redis 7 stack
└── tsconfig.base.json          # Root TypeScript configuration with path aliases
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.0.0` or higher (Node 22+ recommended)
- **npm**: `v10.0.0` or higher
- **Git**: Installed on your system

---

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/bonssss/System_Audit.git
   cd System_Audit
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example `.env` file:
   ```bash
   cp .env.example .env
   ```
   *Default `.env` configuration uses SQLite for zero-setup local development.*

4. **Initialize Database**:
   ```bash
   npx prisma db push --schema=apps/web/prisma/schema.prisma
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🐳 Docker Deployment

To spin up the full production stack with **PostgreSQL 16**, **Redis 7**, and the **Next.js 15 Web App**:

```bash
docker compose up --build
```

Access the platform at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔐 Authentication & Roles

The platform includes built-in authentication using **bcrypt password hashing** and **JWT HTTP-only session cookies**:

- **DEVELOPER**: View repositories, inspect AST issues, and copy AI remediation diffs.
- **AUDITOR**: Approve remediations, mark false positives, and download compliance reports.
- **ADMIN**: Manage system settings, API keys, AI model provider configurations, and user accounts.

To create your account, navigate to `/register` or click **"Register"** in the top navigation header.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server at `localhost:3000` |
| `npm run build` | Builds optimized production bundle across all workspaces |
| `npm run start` | Runs production server |
| `npm run lint` | Runs ESLint type checks and code validation |

---

## 🛡️ License

This project is licensed under the **MIT License**.
