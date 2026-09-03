'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ScanIssue } from '@ai-scanner/shared';

interface SeverityBarChartProps {
  issues: ScanIssue[];
}

export function SeverityBarChart({ issues }: SeverityBarChartProps) {
  const counts = {
    CRITICAL: issues.filter((i) => i.severity === 'CRITICAL').length,
    HIGH: issues.filter((i) => i.severity === 'HIGH').length,
    MEDIUM: issues.filter((i) => i.severity === 'MEDIUM').length,
    LOW: issues.filter((i) => i.severity === 'LOW').length,
    INFO: issues.filter((i) => i.severity === 'INFO').length,
  };

  const data = [
    { severity: 'Critical', count: counts.CRITICAL, color: '#ef4444' },
    { severity: 'High', count: counts.HIGH, color: '#f97316' },
    { severity: 'Medium', count: counts.MEDIUM, color: '#eab308' },
    { severity: 'Low', count: counts.LOW, color: '#71717a' },
    { severity: 'Info', count: counts.INFO, color: '#a1a1aa' },
  ];

  return (
    <div className="clean-card p-6 flex flex-col justify-between shadow-sm">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Findings by Severity Spectrum
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Prioritized risk triage count</p>
      </div>

      <div className="w-full h-56 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="severity" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
            <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
              cursor={{ fill: 'var(--muted)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
