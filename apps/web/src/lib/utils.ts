import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getSeverityColor(severity: string) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        border: 'border-rose-200 dark:border-rose-500/30',
        text: 'text-rose-700 dark:text-rose-400',
        badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40',
        hex: '#ef4444',
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/30',
        text: 'text-amber-800 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
        hex: '#f97316',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-500/10',
        border: 'border-yellow-200 dark:border-yellow-500/30',
        text: 'text-yellow-800 dark:text-yellow-400',
        badge: 'bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40',
        hex: '#eab308',
      };
    case 'LOW':
      return {
        bg: 'bg-zinc-100 dark:bg-zinc-800/60',
        border: 'border-zinc-300 dark:border-zinc-700',
        text: 'text-zinc-800 dark:text-zinc-300',
        badge: 'bg-zinc-200 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
        hex: '#71717a',
      };
    default:
      return {
        bg: 'bg-zinc-100 dark:bg-zinc-800/40',
        border: 'border-zinc-300 dark:border-zinc-700',
        text: 'text-zinc-700 dark:text-zinc-300',
        badge: 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
        hex: '#a1a1aa',
      };
  }
}

export function getGradeBadge(grade: string) {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/50';
    case 'B':
      return 'bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700';
    case 'C':
      return 'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/50';
    case 'D':
      return 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/50';
    default:
      return 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/50';
  }
}
