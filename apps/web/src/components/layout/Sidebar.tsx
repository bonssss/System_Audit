'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  LayoutDashboard,
  FolderGit2,
  Settings,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Repositories', href: '/projects', icon: FolderGit2 },
  { label: 'Live Scanner', href: '/scanner', icon: Terminal, badge: 'AI' },
  { label: 'Rule Catalog', href: '/rules', icon: ShieldAlert },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1f2937] flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#1f2937] gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span>AI Scanner</span>
            <span className="text-[9px] bg-indigo-500/20 text-indigo-400 font-semibold px-1.5 py-0.2 rounded border border-indigo-500/30">
              PRO
            </span>
          </div>
          <div className="text-[10px] text-slate-400">Security Platform</div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </div>

        {MAIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={cn(
                  'text-[10px] font-mono font-bold px-1.5 py-0.2 rounded',
                  isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300'
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Status Card */}
      <div className="p-3 border-t border-[#1f2937]">
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-200">14 Engines</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-medium border border-emerald-500/20">
              Active
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            AST parser & AI ready
          </div>
        </div>
      </div>
    </aside>
  );
}
