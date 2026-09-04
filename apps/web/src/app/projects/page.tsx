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
              className="w-full bg-background border border-border text-foreground text-xs pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-foreground transition-colors"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 bg-foreground text-background hover:opacity-90 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
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
                className="clean-card rounded-2xl p-6 flex flex-col justify-between group space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-muted text-foreground border border-border px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                      {p.sourceType}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${gradeBadge}`}>
                      GRADE {p.latestGrade || 'A'}
                    </span>
                  </div>

                  <Link href={`/projects/${p.id}`}>
                    <h3 className="text-base font-bold text-foreground hover:underline transition-colors font-mono">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {p.description || 'Enterprise codebase'}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{p.lastScanDate ? new Date(p.lastScanDate).toLocaleDateString() : 'Just now'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="w-8 h-8 rounded-lg border border-border hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-500 flex items-center justify-center transition-colors"
                      title="Delete Repository"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/projects/${p.id}`}
                      className="w-8 h-8 rounded-lg bg-muted text-foreground hover:bg-foreground hover:text-background border border-border flex items-center justify-center transition-all shadow-sm"
                      title="Inspect Project"
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
