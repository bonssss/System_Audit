'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How does System Audit differ from traditional linters and legacy SAST tools?',
    answer: 'Traditional linters only look for style issues and simple syntax errors, while legacy SAST tools often produce thousands of noisy false positives without showing you how to fix them. System Audit pairs 14 deep static & AST engines (measuring cognitive complexity, OWASP vulnerabilities, Shannon entropy secrets, N+1 query loops, and Docker/K8s misconfigurations) with an Autonomous AI Synthesizer that generates ready-to-merge unified diff patches for each finding.'
  },
  {
    question: 'Does System Audit send my source code to external servers?',
    answer: 'No. System Audit is architected with a strict privacy-first model. Deterministic AST parsing and static analysis occur entirely locally in ephemeral worker memory. For AI remediations, you can choose to connect to your preferred commercial provider (OpenAI, Anthropic, Gemini) or configure an air-gapped local model (Ollama, vLLM, DeepSeek) so zero bytes ever leave your environment.'
  },
  {
    question: 'How does the AI synthesize unified diffs without hallucinating?',
    answer: 'System Audit feeds the exact AST node coordinates, code context slice, and deterministic CWE rule violation into a fine-tuned remediation prompt. The generated diff is then re-parsed against our AST tokenizer to verify syntax correctness and ensure the vulnerability is resolved before presenting the patch to the developer.'
  },
  {
    question: 'What report formats can I export after an audit?',
    answer: 'You can export in 4 industry-standard formats: (1) Interactive Standalone HTML report that can be emailed or opened in any browser with full filtering; (2) Executive Printable PDF for compliance, management, and audit reviews; (3) SARIF v2.1.0 JSON format for GitHub Code Scanning and GitLab SAST ingestion; and (4) CSV spreadsheet for batch Jira / issue tracker importing.'
  },
  {
    question: 'Can I add custom static analysis rules or adjust severity thresholds?',
    answer: 'Yes! System Audit features a dedicated Rule Catalog where you can enable or disable specific rules, customize severity levels (Critical, High, Medium, Low, Info), and fine-tune Shannon entropy bit thresholds and cyclomatic complexity limits to match your organization’s engineering standards.'
  }
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-xl bg-surface border border-border overflow-hidden transition-colors"
          >
            <button
              onClick={() => toggleFaq(idx)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm font-bold text-foreground">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-foreground' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3 animate-in fade-in duration-150">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
