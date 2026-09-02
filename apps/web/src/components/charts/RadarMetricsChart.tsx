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
    <div className="clean-card p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          7-Axis Defense Radar
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Multi-layer posture distribution</p>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#1f2937" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#374151" />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
              formatter={(value: any) => [`${value} / 100`, 'Score']}
            />
            <Radar
              name="Audit Score"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
