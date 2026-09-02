'use client';

import React, { useState } from 'react';
import { ScanIssue } from '@ai-scanner/shared';
import { getSeverityColor } from '@/lib/utils';
import { FileCode, Sparkles, AlertCircle, ChevronRight, Check, Terminal, ShieldAlert } from 'lucide-react';
import { AIRemediationDrawer } from './AIRemediationDrawer';

export interface CodeFileRecord {
  filePath: string;
  content: string;
}

interface CodeViewerProps {
  files: CodeFileRecord[];
  issues: ScanIssue[];
  initialSelectedFile?: string;
  initialSelectedLine?: number;
}

export function CodeViewer({
  files,
  issues,
  initialSelectedFile,
  initialSelectedLine,
}: CodeViewerProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    initialSelectedFile || (files[0] ? files[0].filePath : '')
  );
  const [activeIssue, setActiveIssue] = useState<ScanIssue | null>(null);

  const currentFile = files.find((f) => f.filePath === selectedFilePath) || files[0];
  const fileIssues = issues.filter((i) => i.location.filePath === currentFile?.filePath);

  const lines = currentFile ? currentFile.content.split(/\r?\n/) : [];

  const issuesByLine = new Map<number, ScanIssue[]>();
  for (const iss of fileIssues) {
    const list = issuesByLine.get(iss.location.startLine) || [];
    list.push(iss);
    issuesByLine.set(iss.location.startLine, list);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel border border-white/[0.08] shadow-2xl flex flex-col h-[720px]">
      {/* IDE Style Top Header */}
      <div className="bg-[#070b16] border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white tracking-wide">{currentFile?.filePath || 'No file selected'}</span>
          
          {fileIssues.length > 0 && (
            <span className="ml-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>{fileIssues.length} Threat{fileIssues.length > 1 ? 's' : ''}</span>
            </span>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          {lines.length} lines • {currentFile ? `${(currentFile.content.length / 1024).toFixed(1)} KB` : '0 KB'} • UTF-8
        </div>
      </div>

      {/* Split Pane: Explorer on left, IDE on right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left File Tree Sidebar */}
        <div className="w-72 bg-[#050813] border-r border-white/[0.06] overflow-y-auto p-3.5 space-y-1">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5 flex items-center justify-between">
            <span>REPOSITORY TREE</span>
            <span className="text-cyan-400">{files.length}</span>
          </div>

          {files.map((f) => {
            const isSelected = f.filePath === currentFile?.filePath;
            const issueCount = issues.filter((i) => i.location.filePath === f.filePath).length;

            return (
              <button
                key={f.filePath}
                onClick={() => setSelectedFilePath(f.filePath)}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-300 font-bold border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                <div className="truncate flex items-center gap-2">
                  <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  <span className="truncate">{f.filePath.split(/[/\\]/).pop()}</span>
                </div>
                {issueCount > 0 && (
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.2 rounded-full border border-rose-500/30">
                    {issueCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Code Content Pane */}
        <div className="flex-1 overflow-y-auto bg-[#030610] font-mono text-xs">
          {lines.map((lineContent, idx) => {
            const lineNum = idx + 1;
            const lineIssues = issuesByLine.get(lineNum);
            const hasIssues = lineIssues && lineIssues.length > 0;
            const primaryIssue = hasIssues ? lineIssues[0] : null;

            return (
              <div key={lineNum} className="flex flex-col group">
                <div
                  className={`flex items-start hover:bg-white/[0.03] transition-colors ${
                    hasIssues ? 'bg-rose-500/10 border-l-2 border-rose-500' : ''
                  }`}
                >
                  {/* Line Number */}
                  <div
                    className={`w-14 py-1 px-3 text-right select-none text-[11px] font-mono flex-shrink-0 ${
                      hasIssues ? 'text-rose-400 font-bold bg-rose-500/15' : 'text-slate-400'
                    }`}
                  >
                    {lineNum}
                  </div>

                  {/* Line Text */}
                  <div className="flex-1 py-1 px-4 text-slate-300 overflow-x-auto whitespace-pre leading-relaxed font-mono">
                    {lineContent || '\u00A0'}
                  </div>

                  {/* Quick AI Trigger Icon on hover */}
                  {hasIssues && (
                    <button
                      onClick={() => setActiveIssue(primaryIssue)}
                      className="opacity-0 group-hover:opacity-100 mr-4 mt-0.5 flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-opacity"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-200" />
                      <span>AI FIX</span>
                    </button>
                  )}
                </div>

                {/* Inline Cyber Issue Alert Banner */}
                {hasIssues &&
                  lineIssues.map((iss) => (
                    <div
                      key={iss.id}
                      className="ml-14 mr-6 my-2 p-4 rounded-2xl bg-[#12070d] border border-rose-500/40 flex items-start justify-between gap-4 text-xs shadow-[0_0_25px_rgba(244,63,94,0.15)] animate-in fade-in"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40 font-mono">
                              {iss.severity}
                            </span>
                            <span className="font-bold text-white">{iss.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({iss.cwe || iss.ruleId})</span>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                            {iss.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveIssue(iss)}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI REMEDIATION</span>
                      </button>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </div>

      <AIRemediationDrawer issue={activeIssue} onClose={() => setActiveIssue(null)} />
    </div>
  );
}
