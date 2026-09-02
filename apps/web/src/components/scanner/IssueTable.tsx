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
    <div className="relative overflow-hidden rounded-3xl glass-panel border border-white/[0.08] shadow-2xl">
      {/* Table Toolbar */}
      <div className="p-6 border-b border-white/[0.06] flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search findings by rule ID, CWE, file, or keyword..."
            className="w-full bg-[#080d1e] border border-white/[0.08] text-slate-200 text-xs pl-11 pr-4 py-3 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#080d1e] border border-white/[0.08] text-slate-300 text-xs px-4 py-3 rounded-2xl focus:outline-none focus:border-cyan-500 font-mono font-medium"
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
            className="bg-[#080d1e] border border-white/[0.08] text-slate-300 text-xs px-4 py-3 rounded-2xl focus:outline-none focus:border-cyan-500 font-mono font-medium"
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
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#070b16] text-[10px] font-mono uppercase tracking-widest text-slate-400 border-b border-white/[0.06]">
            <tr>
              <th className="py-4 px-6 font-semibold">Severity</th>
              <th className="py-4 px-6 font-semibold">Finding / Risk Description</th>
              <th className="py-4 px-6 font-semibold">Domain</th>
              <th className="py-4 px-6 font-semibold">Location</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500 text-xs font-mono">
                  No issues found matching specified filters.
                </td>
              </tr>
            ) : (
              filteredIssues.map((iss) => {
                const sevColor = getSeverityColor(iss.severity);

                return (
                  <tr key={iss.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Severity Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase border shadow-sm ${sevColor.badge}`}>
                        {iss.severity}
                      </span>
                    </td>

                    {/* Title & Description */}
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{iss.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
                        {iss.description}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="bg-[#0c1428] text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                        {iss.category}
                      </span>
                    </td>

                    {/* File Location */}
                    <td className="py-4 px-6 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {onSelectFileLocation ? (
                        <button
                          onClick={() => onSelectFileLocation(iss.location.filePath, iss.location.startLine)}
                          className="hover:text-cyan-400 hover:underline flex items-center gap-1.5 transition-colors"
                        >
                          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{iss.location.filePath}:{iss.location.startLine}</span>
                        </button>
                      ) : (
                        <span>{iss.location.filePath}:{iss.location.startLine}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        iss.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : iss.status === 'FALSE_POSITIVE'
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {iss.status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <button
                        onClick={() => setActiveIssue(iss)}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-cyan-500/20"
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
