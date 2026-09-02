'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { UploadModal } from '@/components/scanner/UploadModal';
import {
  FolderGit2,
  Calendar,
  Clock,
  ArrowLeft,
  Play,
  ArrowRight,
  ShieldCheck,
  Flame,
  FileCode,
} from 'lucide-react';
import { getGradeBadge } from '@/lib/utils';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.success) setProject(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 p-8 text-center">
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <Link href="/projects" className="inline-block mt-4 text-indigo-400 text-xs font-bold">
          ← Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-16">
      <Header
        title={project.name}
        subtitle={`Branch: ${project.defaultBranch} • Type: ${project.sourceType}`}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <div className="px-8 pt-8 space-y-6 max-w-7xl">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="p-2 rounded-xl bg-[#141d33] border border-[#1e2d4d] text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-xs text-slate-400 font-mono">Projects / {project.name}</div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">{project.name}</h2>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Rescan Project</span>
          </button>
        </div>

        {/* Scan History Table */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b border-[#1e293b]">
            <h3 className="text-base font-bold text-white">Scan History & Audit Logs</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b101d] text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#1e293b]">
                <tr>
                  <th className="py-3 px-5 font-semibold">Scan Date</th>
                  <th className="py-3 px-5 font-semibold">Health Grade</th>
                  <th className="py-3 px-5 font-semibold">Overall Score</th>
                  <th className="py-3 px-5 font-semibold">Findings</th>
                  <th className="py-3 px-5 font-semibold">Duration</th>
                  <th className="py-3 px-5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {project.scans.map((scan: any) => {
                  const gradeBadge = getGradeBadge(scan.grade || 'A');

                  return (
                    <tr key={scan.id} className="hover:bg-[#131c31] transition-colors">
                      <td className="py-4 px-5 font-mono text-[11px]">
                        {new Date(scan.createdAt).toLocaleString()}
                      </td>

                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${gradeBadge}`}>
                          GRADE {scan.grade}
                        </span>
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-100">
                        {scan.overallScore} / 100
                      </td>

                      <td className="py-4 px-5 font-mono text-slate-300">
                        {scan.issues.length} detected
                      </td>

                      <td className="py-4 px-5 font-mono text-slate-400 text-[11px]">
                        {scan.durationMs}ms
                      </td>

                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/scans/${scan.id}`}
                          className="inline-flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          <span>Open Audit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onScanStarted={fetchProject} />
    </div>
  );
}
