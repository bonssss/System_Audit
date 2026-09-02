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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a] border border-[#1e293b] p-4 rounded-2xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400">File Name / Path:</span>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-[#161f36] border border-[#223050] text-slate-200 text-xs px-3 py-1.5 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isScanning ? 'Executing Scanner Pipeline...' : 'Run Real-time Scan'}</span>
          </button>
        </div>

        {/* Code Editor & Live Findings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Code Input Area */}
          <div className="bg-[#0b0f1a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl flex flex-col h-[560px]">
            <div className="bg-[#0f172a] border-b border-[#1e293b] px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-400" />
                {fileName}
              </span>
              <span>{code.split('\n').length} lines</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste code snippet here..."
              className="flex-1 w-full bg-[#060911] text-slate-200 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Right: Live Findings List */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl flex flex-col h-[560px]">
            <div className="bg-[#0b101d] border-b border-[#1e293b] px-5 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>Detected Findings ({issues.length})</span>
              </h3>
              {issues.length > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold border border-red-500/30">
                  {issues.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length} High/Crit
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {issues.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Sparkles className="w-8 h-8 text-indigo-500/50" />
                  <p className="text-xs">Click &quot;Run Real-time Scan&quot; to parse code and identify risks.</p>
                </div>
              ) : (
                issues.map((iss) => {
                  const sevCol = getSeverityColor(iss.severity);

                  return (
                    <div
                      key={iss.id}
                      className="bg-[#141d33] border border-[#1e2d4d] hover:border-indigo-500/50 rounded-xl p-4 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sevCol.badge}`}>
                          {iss.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Line {iss.location.startLine}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">{iss.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {iss.description}
                      </p>

                      <div className="pt-2 border-t border-[#1e2d4d] flex justify-end">
                        <button
                          onClick={() => setActiveIssue(iss)}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
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
