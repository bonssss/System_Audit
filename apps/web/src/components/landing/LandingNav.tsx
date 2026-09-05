'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Terminal, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Github,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';

export function LandingNav() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = Boolean(user);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center font-bold shadow-md shadow-foreground/10 group-hover:scale-105 transition-transform duration-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="font-bold text-sm tracking-tight text-foreground flex items-center gap-2">
              <span>System Audit</span>
              <span className="text-[10px] bg-foreground/10 text-foreground font-semibold px-2 py-0.5 rounded-full border border-border">
                v2.4 PRO
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground tracking-wider font-mono">
              ENTERPRISE SAST & AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a href="#simulator" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Live Simulator</span>
          </a>
          <a href="#engines" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>14 Engines</span>
          </a>
          <a href="#architecture" className="hover:text-foreground transition-colors">
            Architecture
          </a>
          <a href="#comparison" className="hover:text-foreground transition-colors">
            Why System Audit
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
          <Link href="/rules" className="hover:text-foreground transition-colors">
            Rule Catalog
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-border transition-colors duration-150"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-foreground text-background hover:opacity-90 transition-all shadow-sm"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/scanner"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-foreground text-background hover:opacity-90 transition-all shadow-sm group"
              >
                <Terminal className="w-3.5 h-3.5 group-hover:rotate-6 transition-transform" />
                <span>Launch Scanner</span>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open mobile menu"
            className="md:hidden p-2 rounded-lg bg-surface text-muted-foreground hover:text-foreground border border-border"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-md px-4 py-4 space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-col space-y-2 text-xs font-medium text-muted-foreground">
            <a 
              href="#simulator" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-surface-hover rounded-lg flex items-center gap-2 text-foreground"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Simulator</span>
            </a>
            <a 
              href="#engines" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-surface-hover rounded-lg flex items-center gap-2 text-foreground"
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>14 Core Engines</span>
            </a>
            <a 
              href="#architecture" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-surface-hover rounded-lg"
            >
              Architecture Pipeline
            </a>
            <a 
              href="#comparison" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-surface-hover rounded-lg"
            >
              Comparison Matrix
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-surface-hover rounded-lg"
            >
              FAQ
            </a>
            <Link 
              href="/rules" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-surface-hover rounded-lg"
            >
              Rule Catalog
            </Link>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-surface hover:bg-surface-hover border border-border text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-foreground text-background"
            >
              Scanner Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
