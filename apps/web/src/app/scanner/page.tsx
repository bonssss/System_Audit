'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { AIRemediationDrawer } from '@/components/scanner/AIRemediationDrawer';
import {
  Cpu,
  Sparkles,
  FileCode,
  ShieldAlert,
  Play,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { ScanIssue, STANDARD_RULES } from '@ai-scanner/shared';
import { getSeverityColor } from '@/lib/utils';

const DEFAULT_CODE_SAMPLE = `import { Request, Response } from 'express';
import { db } from './db';

// Hardcoded API token for payment microservice
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";

export async function handleUserQuery(req: Request, res: Response) {
  const userId = req.query.id as string;

  // SQL Injection vulnerability
  const query = "SELECT * FROM users WHERE id = '" + userId + "' AND active = 1";
  const user = await db.rawQuery(query);

  // Cross-Site Scripting (XSS) vulnerability
  res.send("<div class='profile'>Welcome back: " + user.name + "</div>");
}
`;

export default function SandboxScannerPage() {
  const [code, setCode] = useState(DEFAULT_CODE_SAMPLE);
  const [fileName, setFileName] = useState('src/api/auth.ts');
  const [isScanning, setIsScanning] = useState(false);
  const [issues, setIssues] = useState<ScanIssue[]>([]);
  const [activeIssue, setActiveIssue] = useState<ScanIssue | null>(null);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'sandbox',
          files: [{ path: fileName, content: code, size: code.length }],
        }),
      });
      const data = await res.json();
      if (data.success && data.data.scanId) {
        // Fetch full scan issues
        const scanRes = await fetch(`/api/scans/${data.data.scanId}`);
        const scanData = await scanRes.json();
        if (scanData.success) {
          setIssues(scanData.data.issues);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-16">
      <Header
        title="Live Interactive AST Scanner Sandbox"
        subtitle="Paste arbitrary code snippets to test static analysis and instant AI remediation"
      />

      <div className="px-8 pt-8 space-y-6 max-w-7xl">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-border p-4 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground">File Name / Path:</span>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-background border border-border text-foreground text-xs px-3 py-1.5 rounded-lg font-mono focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-foreground text-background hover:opacity-90 disabled:opacity-50 text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isScanning ? 'Executing Scanner Pipeline...' : 'Run Real-time Scan'}</span>
          </button>
        </div>

        {/* Code Editor & Live Findings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Code Input Area */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[560px] transition-colors">
            <div className="bg-muted/40 border-b border-border px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-foreground" />
                {fileName}
              </span>
              <span>{code.split('\n').length} lines</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste code snippet here..."
              className="flex-1 w-full bg-background text-foreground font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed transition-colors"
              spellCheck={false}
            />
          </div>

          {/* Right: Live Findings List */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[560px] transition-colors">
            <div className="bg-muted/40 border-b border-border px-5 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-foreground" />
                <span>Detected Findings ({issues.length})</span>
              </h3>
              {issues.length > 0 && (
                <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-bold border border-rose-500/30">
                  {issues.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length} High/Crit
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {issues.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                  <p className="text-xs">Click &quot;Run Real-time Scan&quot; to parse code and identify risks.</p>
                </div>
              ) : (
                issues.map((iss) => {
                  const sevCol = getSeverityColor(iss.severity);

                  return (
                    <div
                      key={iss.id}
                      className="bg-background border border-border hover:border-foreground rounded-xl p-4 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sevCol.badge}`}>
                          {iss.severity}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Line {iss.location.startLine}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-foreground leading-snug">{iss.title}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {iss.description}
                      </p>

                      <div className="pt-2 border-t border-border flex justify-end">
                        <button
                          onClick={() => setActiveIssue(iss)}
                          className="flex items-center gap-1.5 bg-foreground text-background hover:opacity-90 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Explain & Fix</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <AIRemediationDrawer issue={activeIssue} onClose={() => setActiveIssue(null)} />
    </div>
  );
}
