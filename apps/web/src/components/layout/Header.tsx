'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, ShieldCheck, LogOut, User, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useSidebar } from '@/lib/sidebar-context';

interface HeaderProps {
  onOpenUpload?: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onOpenUpload, title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { toggle } = useSidebar();

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggle}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors flex-shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="truncate">
          <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
            {title || 'Security Command Center'}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-muted-foreground font-normal truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-background border border-border px-3 py-1 rounded-md text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-foreground">Status:</span>
          <span className="text-foreground font-medium">Active</span>
        </div>

        {/* Search */}
        <div className="relative w-36 sm:w-48 md:w-60 hidden xs:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-foreground transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-md border border-border bg-background hover:bg-surface-hover text-foreground transition-colors duration-150 flex items-center justify-center flex-shrink-0"
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
            className="flex items-center gap-1.5 bg-foreground text-background hover:opacity-90 text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-md transition-all shadow-sm flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Scan</span>
            <span className="sm:hidden">Scan</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-border hidden sm:block" />

        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-muted border border-border text-foreground font-bold text-xs flex items-center justify-center font-mono">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="hidden sm:block text-left max-w-[100px] truncate">
                <div className="text-xs font-semibold text-foreground truncate">{user.name || user.email}</div>
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 sm:px-3 py-1.5 rounded-md hover:bg-surface-hover transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-medium bg-foreground text-background hover:opacity-90 px-2 sm:px-3 py-1.5 rounded-md transition-all hidden xs:inline-block"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
