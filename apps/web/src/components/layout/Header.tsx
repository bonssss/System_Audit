'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, ShieldCheck, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  onOpenUpload?: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onOpenUpload, title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#111827] border-b border-[#1f2937] px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base font-bold text-white tracking-tight">
          {title || 'Security Command Center'}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 font-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Simple Status Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-[#0b0f19] border border-[#1f2937] px-3 py-1 rounded-md text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-400">Status:</span>
          <span className="text-emerald-400 font-medium">Active</span>
        </div>

        {/* Search */}
        <div className="relative w-56">
          <input
            type="text"
            placeholder="Search code / rules..."
            className="w-full bg-[#0b0f19] border border-[#1f2937] text-xs text-slate-200 placeholder-slate-500 rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-[#1f2937]" />

        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center font-mono">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200">{user.name || user.email}</div>
                <div className="text-[10px] text-indigo-400 font-mono">{user.role}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-[#1f2937] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md border border-slate-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
