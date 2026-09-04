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

  // Do not render sidebar on landing page, login, or register pages
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen sticky top-0 select-none z-30 transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border gap-3">
        <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
            <span>AI Scanner</span>
            <span className="text-[9px] bg-foreground/10 text-foreground font-semibold px-1.5 py-0.5 rounded border border-border">
              PRO
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">Security Platform</div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn('w-4 h-4', isActive ? 'text-background' : 'text-muted-foreground')} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={cn(
                  'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded',
                  isActive ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground border border-border'
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Status Card */}
      <div className="p-3 border-t border-border">
        <div className="bg-background border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-foreground">14 Engines</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium border border-emerald-500/20">
              Active
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            AST parser & AI ready
          </div>
        </div>
      </div>
    </aside>
  );
}
