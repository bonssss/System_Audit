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
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg space-y-3 animate-in fade-in transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center border border-border">
            <Cpu className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <span>{progress.stepName}</span>
              <span className="text-[10px] bg-muted text-foreground px-1.5 py-0.5 rounded border border-border">
                Stage {progress.currentStep} / {progress.totalSteps}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{progress.message}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-base font-black text-foreground">{progress.percent}%</span>
        </div>
      </div>

      <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border">
        <div
          className="bg-foreground h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
