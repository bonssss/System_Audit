'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { LanguageStat } from '@ai-scanner/shared';

interface LanguageDonutChartProps {
  languages: LanguageStat[];
}

export function LanguageDonutChart({ languages }: LanguageDonutChartProps) {
  const data = languages.map((l) => ({
    name: l.language,
    value: l.linesOfCode,
    color: l.color,
    percentage: l.percentage,
  }));

  return (
    <div className="clean-card p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Ecosystem & Language Composition
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Codebase footprint distribution</p>
      </div>

      <div className="w-full h-56 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
              formatter={(value: any, name: any, props: any) => [`${value.toLocaleString()} LOC (${props.payload.percentage}%)`, name]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(val) => <span className="text-xs text-slate-400">{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
