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
    { severity: 'Low', count: counts.LOW, color: '#3b82f6' },
    { severity: 'Info', count: counts.INFO, color: '#6b7280' },
  ];

  return (
    <div className="clean-card p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Findings by Severity Spectrum
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Prioritized risk triage count</p>
      </div>

      <div className="w-full h-56 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="severity" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
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
