'use client';

import React from 'react';
import { Scores } from '@ai-scanner/shared';

interface ProjectScoreDialProps {
  scores: Scores;
}

export function ProjectScoreDial({ scores }: ProjectScoreDialProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scores.overall / 100) * circumference;

  let strokeColor = '#10b981'; // emerald
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (scores.overall < 60) {
    strokeColor = '#ef4444';
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (scores.overall < 75) {
    strokeColor = '#f97316';
    badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  } else if (scores.overall < 88) {
    strokeColor = '#6366f1';
    badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  }

  return (
    <div className="clean-card p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Security Health Index
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Synthesized 14-engine rating</p>
        </div>

        <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${badgeColor}`}>
          Grade {scores.grade}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
        {/* Simple Flat Radial SVG Dial */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-white tracking-tight">
              {scores.overall}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              / 100
            </span>
          </div>
        </div>

        {/* Flat Sub-Scores Matrix */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-3">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Security</div>
            <div className="text-base font-bold text-white mt-0.5 font-mono">{scores.security}<span className="text-[10px] text-slate-500 font-normal">/100</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${scores.security}%` }} />
            </div>
          </div>

          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-3">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Code Quality</div>
            <div className="text-base font-bold text-white mt-0.5 font-mono">{scores.quality}<span className="text-[10px] text-slate-500 font-normal">/100</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${scores.quality}%` }} />
            </div>
          </div>

          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-3">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Architecture</div>
            <div className="text-base font-bold text-white mt-0.5 font-mono">{scores.architecture}<span className="text-[10px] text-slate-500 font-normal">/100</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${scores.architecture}%` }} />
            </div>
          </div>

          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-3">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Maintainability</div>
            <div className="text-base font-bold text-white mt-0.5 font-mono">{scores.maintainability}<span className="text-[10px] text-slate-500 font-normal">/100</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scores.maintainability}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
