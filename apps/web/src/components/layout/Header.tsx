'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, ShieldCheck, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

interface HeaderProps {
  onOpenUpload?: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onOpenUpload, title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-surface border-b border-border px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      <div>
        <h1 className="text-base font-bold text-foreground tracking-tight">
          {title || 'Security Command Center'}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground font-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3.5">
        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-background border border-border px-3 py-1 rounded-md text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-foreground">Status:</span>
          <span className="text-foreground font-medium">Active</span>
        </div>

        {/* Search */}
        <div className="relative w-52 md:w-60">
          <input
            type="text"
            placeholder="Search code / rules..."
            className="w-full bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-foreground transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-md border border-border bg-background hover:bg-surface-hover text-foreground transition-colors duration-150 flex items-center justify-center"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300 transition-transform duration-200 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700 transition-transform duration-200 -rotate-12 hover:rotate-0" />
          )}
        </button>

        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 bg-foreground text-background hover:opacity-90 text-xs font-semibold px-3.5 py-1.5 rounded-md transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-border" />

        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-muted border border-border text-foreground font-bold text-xs flex items-center justify-center font-mono">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-foreground">{user.name || user.email}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{user.role}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-surface-hover transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-medium bg-foreground text-background hover:opacity-90 px-3 py-1.5 rounded-md transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
