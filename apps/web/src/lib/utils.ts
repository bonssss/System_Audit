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
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        hex: '#ef4444',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        hex: '#f97316',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        hex: '#eab308',
      };
    case 'LOW':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        hex: '#3b82f6',
      };
    default:
      return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        hex: '#8b5cf6',
      };
  }
}

export function getGradeBadge(grade: string) {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20';
    case 'B':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-blue-500/20';
    case 'C':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-yellow-500/20';
    case 'D':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-orange-500/20';
    default:
      return 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/20';
  }
}
