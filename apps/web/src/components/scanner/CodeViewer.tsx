'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScanIssue } from '@ai-scanner/shared';
import { getSeverityColor } from '@/lib/utils';
import { 
  FileCode, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  Check, 
  Terminal, 
  ShieldAlert, 
  Search, 
  Copy,
  ExternalLink,
  Code2
} from 'lucide-react';
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
  const [fileSearch, setFileSearch] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    initialSelectedFile || (files[0] ? files[0].filePath : '')
  );
  const [highlightLine, setHighlightLine] = useState<number>(initialSelectedLine || 1);
  const [activeIssue, setActiveIssue] = useState<ScanIssue | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Synchronize when initialSelectedFile or initialSelectedLine changes (e.g. from IssueTable click)
  useEffect(() => {
    if (initialSelectedFile) {
      setSelectedFilePath(initialSelectedFile);
    }
    if (initialSelectedLine) {
      setHighlightLine(initialSelectedLine);
    }
  }, [initialSelectedFile, initialSelectedLine]);

  // Smooth scroll to highlighted line
  useEffect(() => {
    if (highlightLine && lineRefs.current.has(highlightLine)) {
      const el = lineRefs.current.get(highlightLine);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightLine, selectedFilePath]);

  const currentFile = files.find((f) => f.filePath === selectedFilePath) || files[0];
  const fileIssues = issues.filter(
    (i) => (i.location?.filePath || (i as any).filePath) === currentFile?.filePath
  );

  const lines = currentFile ? currentFile.content.split(/\r?\n/) : [];

  const issuesByLine = new Map<number, ScanIssue[]>();
  for (const iss of fileIssues) {
    const lineNum = iss.location?.startLine || (iss as any).startLine || 1;
    const list = issuesByLine.get(lineNum) || [];
    list.push(iss);
    issuesByLine.set(lineNum, list);
  }

  const filteredFiles = files.filter((f) =>
    f.filePath.toLowerCase().includes(fileSearch.toLowerCase())
  );

  const handleCopyCode = () => {
    if (currentFile?.content) {
      navigator.clipboard.writeText(currentFile.content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyPath = () => {
    if (currentFile?.filePath) {
      navigator.clipboard.writeText(currentFile.filePath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    }
  };

  return (
    <div className="clean-card rounded-2xl overflow-hidden shadow-sm flex flex-col h-[750px] transition-colors">
      {/* IDE Style Top Header */}
      <div className="bg-muted/40 border-b border-border px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs font-mono text-foreground">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
          </div>

          <FileCode className="w-4 h-4 text-foreground flex-shrink-0" />
          <span className="font-bold text-foreground tracking-wide truncate max-w-md">
            {currentFile?.filePath || 'No file selected'}
          </span>
          
          {fileIssues.length > 0 && (
            <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>{fileIssues.length} Finding{fileIssues.length > 1 ? 's' : ''}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span className="hidden sm:inline">
            {lines.length} lines • {currentFile ? `${(currentFile.content.length / 1024).toFixed(1)} KB` : '0 KB'}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyPath}
              className="px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-border text-[11px] text-foreground transition-colors flex items-center gap-1"
              title="Copy File Path"
            >
              {copiedPath ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPath ? 'Path Copied' : 'Path'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="px-2 py-1 rounded bg-surface hover:bg-surface-hover border border-border text-[11px] text-foreground transition-colors flex items-center gap-1"
              title="Copy Entire File"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Code2 className="w-3 h-3" />}
              <span>{copiedCode ? 'Code Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Split Pane: Explorer on left, IDE on right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left File Tree Sidebar */}
        <div className="w-80 bg-surface border-r border-border overflow-y-auto p-3.5 space-y-2 flex flex-col">
          {/* File Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-background border border-border text-foreground text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-foreground font-mono transition-colors"
            />
          </div>

          <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest px-1 pt-1 flex items-center justify-between">
            <span>REPOSITORY TREE</span>
            <span className="text-foreground">{filteredFiles.length} files</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {filteredFiles.map((f) => {
              const isSelected = f.filePath === currentFile?.filePath;
              const issueCount = issues.filter(
                (i) => (i.location?.filePath || (i as any).filePath) === f.filePath
              ).length;

              return (
                <button
                  key={f.filePath}
                  onClick={() => {
                    setSelectedFilePath(f.filePath);
                    setHighlightLine(1);
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                    isSelected
                      ? 'bg-foreground text-background font-bold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  <div className="truncate flex items-center gap-2">
                    <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isSelected ? 'text-background' : 'text-muted-foreground'}`} />
                    <span className="truncate" title={f.filePath}>
                      {f.filePath.split(/[/\\]/).pop()}
                    </span>
                  </div>
                  {issueCount > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      isSelected 
                        ? 'bg-background/20 text-background border-background/40' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    }`}>
                      {issueCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Content Pane */}
        <div className="flex-1 overflow-y-auto bg-background font-mono text-xs select-text">
          {lines.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs font-mono">
              No content available for this file.
            </div>
          ) : (
            lines.map((lineContent, idx) => {
              const lineNum = idx + 1;
              const lineIssues = issuesByLine.get(lineNum);
              const hasIssues = lineIssues && lineIssues.length > 0;
              const primaryIssue = hasIssues ? lineIssues[0] : null;
              const isTargetLine = highlightLine === lineNum;

              return (
                <div 
                  key={lineNum} 
                  ref={(el) => {
                    if (el) lineRefs.current.set(lineNum, el);
                    else lineRefs.current.delete(lineNum);
                  }}
                  className="flex flex-col group"
                >
                  <div
                    className={`flex items-start hover:bg-muted/40 transition-colors ${
                      isTargetLine 
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-l-2 border-amber-500' 
                        : hasIssues 
                          ? 'bg-rose-500/5 dark:bg-rose-500/10 border-l-2 border-rose-500' 
                          : ''
                    }`}
                  >
                    {/* Line Number */}
                    <div
                      onClick={() => setHighlightLine(lineNum)}
                      className={`w-14 py-1 px-3 text-right select-none text-[11px] font-mono flex-shrink-0 cursor-pointer ${
                        hasIssues 
                          ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10' 
                          : isTargetLine
                            ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10'
                            : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {lineNum}
                    </div>

                    {/* Line Text */}
                    <div className="flex-1 py-1 px-4 text-foreground overflow-x-auto whitespace-pre leading-relaxed font-mono">
                      {lineContent || '\u00A0'}
                    </div>

                    {/* Quick AI Trigger Icon on hover */}
                    {hasIssues && (
                      <button
                        onClick={() => setActiveIssue(primaryIssue)}
                        className="opacity-0 group-hover:opacity-100 mr-4 mt-0.5 flex items-center gap-1 bg-foreground text-background px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold shadow-sm transition-opacity flex-shrink-0"
                      >
                        <Sparkles className="w-3 h-3 text-background" />
                        <span>AI FIX</span>
                      </button>
                    )}
                  </div>

                  {/* Inline Issue Alert Banner */}
                  {hasIssues &&
                    lineIssues.map((iss) => (
                      <div
                        key={iss.id}
                        className="ml-14 mr-6 my-2 p-4 rounded-2xl bg-surface border border-rose-500/30 flex items-start justify-between gap-4 text-xs shadow-sm animate-in fade-in"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 font-mono">
                                {iss.severity}
                              </span>
                              <span className="font-bold text-foreground">{iss.title}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">({iss.cwe || iss.ruleId})</span>
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed max-w-2xl">
                              {iss.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveIssue(iss)}
                          className="flex items-center gap-1.5 bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex-shrink-0 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>AI REMEDIATION</span>
                        </button>
                      </div>
                    ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      <AIRemediationDrawer issue={activeIssue} onClose={() => setActiveIssue(null)} />
    </div>
  );
}
