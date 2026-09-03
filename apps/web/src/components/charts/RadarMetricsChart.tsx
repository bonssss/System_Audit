'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Scores } from '@ai-scanner/shared';

interface RadarMetricsChartProps {
  scores: Scores;
}

export function RadarMetricsChart({ scores }: RadarMetricsChartProps) {
  const data = [
    { subject: 'Security', score: scores.security, fullMark: 100 },
    { subject: 'Code Quality', score: scores.quality, fullMark: 100 },
    { subject: 'Performance', score: scores.performance, fullMark: 100 },
    { subject: 'Architecture', score: scores.architecture, fullMark: 100 },
    { subject: 'Maintainability', score: scores.maintainability, fullMark: 100 },
    { subject: 'Documentation', score: scores.documentation, fullMark: 100 },
    { subject: 'Testing', score: scores.testing, fullMark: 100 },
  ];

  return (
    <div className="clean-card p-6 flex flex-col justify-between shadow-sm">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          7-Axis Defense Radar
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Multi-layer posture distribution</p>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
              formatter={(value: any) => [`${value} / 100`, 'Score']}
            />
            <Radar
              name="Audit Score"
              dataKey="score"
              stroke="var(--foreground)"
              fill="var(--foreground)"
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
