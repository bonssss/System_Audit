'use client';

import React, { useState } from 'react';
import { AIRemediation, ScanIssue } from '@ai-scanner/shared';
import { getSeverityColor } from '@/lib/utils';
import {
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  Check,
  Copy,
  ExternalLink,
  Flame,
  AlertTriangle,
  FileCode,
  Terminal,
  Zap,
} from 'lucide-react';

interface AIRemediationDrawerProps {
  issue: ScanIssue | null;
  onClose: () => void;
}

export function AIRemediationDrawer({ issue, onClose }: AIRemediationDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!issue) return null;

  const rem = issue.remediation;
  const sevColors = getSeverityColor(issue.severity);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-surface border-l border-border h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 transition-colors">
        {/* Drawer Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-muted/30">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-muted text-foreground border border-border">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border ${sevColors.badge}`}>
                  {issue.severity}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {issue.cwe || issue.ruleId}
                </span>
                {rem?.confidence && (
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    {rem.confidence}% AI CONFIDENCE
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-foreground leading-snug">{issue.title}</h2>
              <div className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-foreground" />
                <span>{issue.location.filePath}:{issue.location.startLine}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted text-foreground">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">Estimated Effort</div>
                <div className="text-xs font-bold font-mono text-foreground mt-0.5">{rem?.estimatedEffort || '15 minutes'}</div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted text-foreground">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">OWASP Category</div>
                <div className="text-xs font-bold text-foreground truncate mt-0.5">{issue.owaspCategory || 'Code Health'}</div>
              </div>
            </div>
          </div>

          {/* Root Cause / Why it matters */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>ROOT CAUSE & SECURITY RATIONALE</span>
            </h3>
            <div className="bg-background border border-border rounded-2xl p-4 text-xs text-foreground leading-relaxed">
              {rem?.whyItMatters || issue.description}
            </div>
          </div>

          {/* Business & System Impact */}
          {rem?.businessImpact && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>BUSINESS & OPERATIONAL IMPACT</span>
              </h3>
              <div className="bg-background border border-border rounded-2xl p-4 text-xs text-foreground leading-relaxed">
                {rem.businessImpact}
              </div>
            </div>
          )}

          {/* Vulnerable Code Snippet */}
          {issue.location.snippet && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-rose-500" />
                <span>VULNERABLE CODE LOCATION</span>
              </h3>
              <div className="bg-background border border-rose-500/30 rounded-2xl p-4 font-mono text-xs text-rose-600 dark:text-rose-300 overflow-x-auto">
                <div className="text-[10px] text-muted-foreground mb-1">Line {issue.location.startLine}:</div>
                <code>{issue.location.snippet}</code>
              </div>
            </div>
          )}

          {/* Recommended Fix with Unified Diff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-foreground" />
                <span>AI SYNTHESIZED REMEDIATION PATCH</span>
              </h3>
              <button
                onClick={() => copyCode(rem?.diffPatch || rem?.recommendedFix || '')}
                className="flex items-center gap-1.5 text-xs text-foreground hover:opacity-80 font-mono font-bold transition-all bg-muted px-3 py-1 rounded-lg border border-border"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED PATCH' : 'COPY PATCH'}</span>
              </button>
            </div>

            {rem?.diffPatch ? (
              <div className="bg-background border border-border rounded-2xl p-4 font-mono text-xs overflow-x-auto">
                {rem.diffPatch.split('\n').map((line, idx) => {
                  let lineClass = 'text-muted-foreground';
                  if (line.startsWith('+')) lineClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 -mx-4 px-4 block font-semibold';
                  else if (line.startsWith('-')) lineClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 -mx-4 px-4 block font-semibold';
                  else if (line.startsWith('@@')) lineClass = 'text-foreground font-bold';

                  return (
                    <div key={idx} className={lineClass}>
                      {line}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-background border border-border rounded-2xl p-4 font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                {rem?.recommendedFix}
              </div>
            )}
          </div>

          {/* External References */}
          {rem?.references && rem.references.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                OFFICIAL MITRE CWE & OWASP ADVISORIES
              </h3>
              <div className="space-y-2">
                {rem.references.map((refUrl, idx) => (
                  <a
                    key={idx}
                    href={refUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-foreground hover:underline bg-background p-3 rounded-xl border border-border"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate font-mono">{refUrl}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground">AI Project Scanner Security Synthesis</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-muted hover:bg-surface-hover text-foreground text-xs font-mono font-bold rounded-xl transition-colors border border-border"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
