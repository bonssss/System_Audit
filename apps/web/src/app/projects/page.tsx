'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { UploadModal } from '@/components/scanner/UploadModal';
import {
  FolderGit2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { getGradeBadge } from '@/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete repository "${name}"?`)) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col pb-20">
      <Header
        title="Repositories & Codebases"
        subtitle="Continuous security audit tracking, branch history, and compliance"
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <div className="px-8 pt-8 space-y-6 max-w-7xl">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter repositories..."
              className="w-full bg-[#0e111d] border border-white/[0.08] text-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-indigo-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white text-xs font-bold font-mono px-5 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>INGEST REPOSITORY</span>
          </button>
        </div>

        {/* Repos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {filtered.map((p) => {
            const gradeBadge = getGradeBadge(p.latestGrade || 'A');

            return (
              <div
                key={p.id}
                className="linear-card rounded-3xl p-6 flex flex-col justify-between group space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#121626] text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                      {p.sourceType}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono border ${gradeBadge}`}>
                      GRADE {p.latestGrade || 'A'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors font-mono">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description || 'Enterprise codebase'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{p.lastScanDate ? new Date(p.lastScanDate).toLocaleDateString() : 'Just now'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="w-8 h-8 rounded-xl border border-white/[0.08] hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-colors"
                      title="Delete Repository"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/scans/${p.id}`}
                      className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 flex items-center justify-center transition-all shadow-sm"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onScanStarted={fetchProjects} />
    </div>
  );
}
