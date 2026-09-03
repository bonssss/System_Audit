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
    <div className="clean-card p-6 flex flex-col justify-between shadow-sm">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ecosystem & Language Composition
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Codebase footprint distribution</p>
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
                <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
              formatter={(value: any, name: any, props: any) => [`${value.toLocaleString()} LOC (${props.payload.percentage}%)`, name]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(val) => <span className="text-xs text-muted-foreground">{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
