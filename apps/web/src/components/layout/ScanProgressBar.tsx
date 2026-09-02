'use client';

import React, { useEffect, useState } from 'react';
import { ScanProgress } from '@ai-scanner/shared';
import { Cpu, CheckCircle2 } from 'lucide-react';

interface ScanProgressBarProps {
  scanId: string;
  onComplete?: () => void;
}

export function ScanProgressBar({ scanId, onComplete }: ScanProgressBarProps) {
  const [progress, setProgress] = useState<ScanProgress | null>(null);

  useEffect(() => {
    if (!scanId) return;

    const eventSource = new EventSource(`/api/scans/${scanId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data: ScanProgress = JSON.parse(event.data);
        setProgress(data);

        if (data.percent >= 100) {
          setTimeout(() => {
            eventSource.close();
            if (onComplete) onComplete();
          }, 1200);
        }
      } catch {
        // ignore parse error
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [scanId, onComplete]);

  if (!progress) return null;

  return (
    <div className="bg-[#10182b] border border-indigo-500/30 rounded-2xl p-5 shadow-2xl space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Cpu className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{progress.stepName}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-500/30">
                Stage {progress.currentStep} / {progress.totalSteps}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{progress.message}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-base font-black text-indigo-400">{progress.percent}%</span>
        </div>
      </div>

      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
