'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { UploadModal } from '@/components/scanner/UploadModal';
import { ProjectScoreDial } from '@/components/charts/ProjectScoreDial';
import { RadarMetricsChart } from '@/components/charts/RadarMetricsChart';
import {
  FolderGit2,
  ShieldAlert,
  Flame,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Terminal,
  Layers,
  FileCode,
  ShieldCheck,
  Play,
  ArrowUpRight,
} from 'lucide-react';
import { getGradeBadge } from '@/lib/utils';
import { SAMPLE_PROJECTS } from '@/lib/sample-projects';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, projRes] = await Promise.all([
          fetch('/api/statistics'),
          fetch('/api/projects'),
        ]);
        const statsData = await statsRes.json();
        const projData = await projRes.json();
        if (statsData.success) setStats(statsData.data);
        if (projData.success) setProjects(projData.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const defaultScores = {
    overall: stats?.averageScores?.overall ?? 0,
    grade: (stats?.averageScores?.grade || 'N/A') as any,
    security: stats?.averageScores?.security ?? 0,
    quality: stats?.averageScores?.quality ?? 0,
    performance: stats?.averageScores?.performance ?? 0,
    architecture: stats?.averageScores?.architecture ?? 0,
    maintainability: stats?.averageScores?.maintainability ?? 0,
    documentation: stats?.averageScores?.documentation ?? 0,
    testing: stats?.averageScores?.testing ?? 0,
  };

  return (
    <div className="flex-1 flex flex-col pb-16">
      <Header
        title="Security Command Center"
        subtitle="Continuous vulnerability auditing, dependency monitoring, and architectural health"
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Banner */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  DEFENSE ACTIVE
                </span>
                <span className="text-xs text-slate-400">• 14 Scan Engines Synchronized</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Automated Security & Architecture Auditing
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                AST parsing scans for SQLi, XSS, Secret Leaks, and circular architectural loops with instantaneous AI remediations.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Launch Audit Scan</span>
          </button>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Audited Repos</span>
              <div className="w-7 h-7 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center">
                <FolderGit2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              {stats?.totalProjects ?? projects.length}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              Active monitoring
            </div>
          </div>

          {/* Card 2 */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Completed Scans</span>
              <div className="w-7 h-7 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-400 mt-2 font-mono">
              {stats?.totalScans ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              14 engines synchronized
            </div>
          </div>

          {/* Card 3 */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Critical Findings</span>
              <div className="w-7 h-7 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">
              {stats?.criticalIssues ?? 0}
            </div>
            <div className="text-[11px] text-rose-400/80 mt-1">
              Immediate AI fix ready
            </div>
          </div>

          {/* Card 4 */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>High Severity Items</span>
              <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
              {stats?.highIssues ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Triaged for next release
            </div>
          </div>
        </div>

        {/* Visualizations (Score Dial & Radar Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ProjectScoreDial scores={defaultScores} />
          <RadarMetricsChart scores={defaultScores} />
        </div>

        {/* Repositories Directory Table */}
        <div className="clean-card overflow-hidden">
          <div className="p-5 border-b border-[#1f2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">
                Active Repositories Directory
              </h3>
            </div>
            <Link
              href="/projects"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-[#1f2937]">
                <tr>
                  <th className="py-3 px-5">Repository</th>
                  <th className="py-3 px-5">Source</th>
                  <th className="py-3 px-5">Health Grade</th>
                  <th className="py-3 px-5">Threat Items</th>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No repositories ingested yet. Click &quot;New Scan&quot; to begin.
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => {
                    const gradeBadge = getGradeBadge(p.latestGrade || 'A');

                    return (
                      <tr key={p.id} className="hover:bg-[#1f2937]/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-white text-xs">{p.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {p.description || 'Enterprise repository'}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 font-mono text-[11px]">
                          <span className="bg-[#0b0f19] text-slate-300 px-2 py-0.5 rounded border border-[#1f2937]">
                            {p.sourceType}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${gradeBadge}`}>
                            Grade {p.latestGrade || 'A'} ({p.latestScore || 100})
                          </span>
                        </td>

                        <td className="py-3.5 px-5 font-mono">
                          {p.criticalIssuesCount > 0 ? (
                            <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                              {p.criticalIssuesCount} Critical
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Clean</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                          {p.lastScanDate ? new Date(p.lastScanDate).toLocaleDateString() : 'Just now'}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <Link
                            href={`/projects/${p.id}`}
                            className="inline-flex items-center gap-1 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500 px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
