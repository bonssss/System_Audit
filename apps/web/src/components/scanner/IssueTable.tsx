'use client';

import React, { useState } from 'react';
import { ScanIssue, Severity, IssueCategory } from '@ai-scanner/shared';
import { getSeverityColor } from '@/lib/utils';
import {
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Shield,
  Layers,
  Zap,
} from 'lucide-react';
import { AIRemediationDrawer } from './AIRemediationDrawer';

interface IssueTableProps {
  issues: ScanIssue[];
  onSelectFileLocation?: (filePath: string, line: number) => void;
  onStatusChange?: (issueId: string, newStatus: string) => void;
}

export function IssueTable({ issues, onSelectFileLocation, onStatusChange }: IssueTableProps) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [activeIssue, setActiveIssue] = useState<ScanIssue | null>(null);

  const filteredIssues = issues.filter((issue) => {
    const matchesSeverity = severityFilter === 'ALL' || issue.severity === severityFilter;
    const matchesCategory = categoryFilter === 'ALL' || issue.category === categoryFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      issue.title.toLowerCase().includes(query) ||
      issue.location.filePath.toLowerCase().includes(query) ||
      issue.ruleId.toLowerCase().includes(query) ||
      (issue.cwe && issue.cwe.toLowerCase().includes(query));

    return matchesSeverity && matchesCategory && matchesSearch;
  });

  return (
    <div className="clean-card rounded-2xl overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search findings by rule ID, CWE, file, or keyword..."
            className="w-full bg-background border border-border text-foreground text-xs pl-10 pr-4 py-2.5 rounded-xl placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-background border border-border text-foreground text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-foreground font-mono font-medium transition-colors"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-border text-foreground text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-foreground font-mono font-medium transition-colors"
          >
            <option value="ALL">All Categories</option>
            <option value="SECURITY">Security</option>
            <option value="CODE_QUALITY">Code Quality</option>
            <option value="COMPLEXITY">Complexity</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="ARCHITECTURE">Architecture</option>
            <option value="DEPENDENCY">Dependencies</option>
            <option value="API">API</option>
            <option value="DATABASE">Database</option>
            <option value="DOCKER">Docker</option>
            <option value="KUBERNETES">Kubernetes</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-foreground">
          <thead className="bg-muted/40 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3.5 px-5 font-semibold">Severity</th>
              <th className="py-3.5 px-5 font-semibold">Finding / Risk Description</th>
              <th className="py-3.5 px-5 font-semibold">Domain</th>
              <th className="py-3.5 px-5 font-semibold">Location</th>
              <th className="py-3.5 px-5 font-semibold">Status</th>
              <th className="py-3.5 px-5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-muted-foreground text-xs font-mono">
                  No issues found matching specified filters.
                </td>
              </tr>
            ) : (
              filteredIssues.map((iss) => {
                const sevColor = getSeverityColor(iss.severity);

                return (
                  <tr key={iss.id} className="hover:bg-surface-hover/80 transition-colors group">
                    {/* Severity Badge */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border shadow-sm ${sevColor.badge}`}>
                        {iss.severity}
                      </span>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3.5 px-5 max-w-md">
                      <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <span>{iss.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">
                        {iss.description}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="bg-muted text-foreground border border-border px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                        {iss.category}
                      </span>
                    </td>

                    {/* File Location */}
                    <td className="py-3.5 px-5 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {onSelectFileLocation ? (
                        <button
                          onClick={() => onSelectFileLocation(iss.location.filePath, iss.location.startLine)}
                          className="hover:text-foreground hover:underline flex items-center gap-1.5 transition-colors"
                        >
                          <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{iss.location.filePath}:{iss.location.startLine}</span>
                        </button>
                      ) : (
                        <span>{iss.location.filePath}:{iss.location.startLine}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        iss.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : iss.status === 'FALSE_POSITIVE'
                          ? 'bg-muted text-muted-foreground border-border'
                          : 'bg-muted text-foreground border-border'
                      }`}>
                        {iss.status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-5 whitespace-nowrap text-right">
                      <button
                        onClick={() => setActiveIssue(iss)}
                        className="inline-flex items-center gap-1.5 bg-foreground text-background hover:opacity-90 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI FIX</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* AI Remediation Slide-out */}
      <AIRemediationDrawer issue={activeIssue} onClose={() => setActiveIssue(null)} />
    </div>
  );
}
