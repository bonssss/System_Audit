'use client';

import React from 'react';
import { ArchitectureAnalysis } from '@ai-scanner/shared';
import { Network, AlertOctagon, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';

interface ArchitectureGraphProps {
  architecture: ArchitectureAnalysis;
}

export function ArchitectureGraph({ architecture }: ArchitectureGraphProps) {
  const { nodes, edges, circularDependencies, layerViolations, packageCouplingScore, cohesionScore } = architecture;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Modules / Nodes</div>
          <div className="text-2xl font-bold text-white mt-1">{nodes.length}</div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase">Import Dependencies</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{edges.length}</div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase">Circular Reference Loops</div>
          <div className={`text-2xl font-bold mt-1 ${circularDependencies.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {circularDependencies.length}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase">Coupling Score</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{packageCouplingScore}<span className="text-xs text-slate-400">/100</span></div>
        </div>
      </div>

      {/* Circular Dependency Warning Callout */}
      {circularDependencies.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-3">
            <AlertOctagon className="w-5 h-5" />
            <span>Critical Circular Dependencies Detected</span>
          </div>
          <div className="space-y-2">
            {circularDependencies.map((cycle, idx) => (
              <div key={idx} className="bg-[#10080d] border border-red-500/30 rounded-xl p-3 text-xs font-mono text-slate-200 flex items-center flex-wrap gap-2">
                {cycle.map((nodePath, nIdx) => (
                  <React.Fragment key={nIdx}>
                    <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold border border-red-500/40">
                      {nodePath.split(/[/\\]/).pop()}
                    </span>
                    {nIdx < cycle.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-red-400" />}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Dependency Visual Grid */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-indigo-400" />
          <span>Module Interaction & Coupling Graph</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {nodes.map((node) => {
            const outEdges = edges.filter((e) => e.source === node.id);
            const inEdges = edges.filter((e) => e.target === node.id);
            const hasCycle = edges.some((e) => e.source === node.id && e.isCircular);

            return (
              <div
                key={node.id}
                className={`bg-[#141d33] border rounded-xl p-4 transition-all hover:border-indigo-500/50 ${
                  hasCycle ? 'border-red-500/50 shadow-red-500/10' : 'border-[#1e2d4d]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-xs font-bold text-slate-200 truncate">
                    {node.label}
                  </div>
                  {hasCycle && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                      Circular
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>Imports: <span className="text-indigo-400 font-semibold">{outEdges.length} modules</span></div>
                  <div>Imported by: <span className="text-emerald-400 font-semibold">{inEdges.length} modules</span></div>
                </div>

                {outEdges.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#1e2b48] flex flex-wrap gap-1">
                    {outEdges.slice(0, 3).map((e, idx) => (
                      <span key={idx} className="bg-[#0b101f] text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50">
                        ➔ {e.target.split(/[/\\]/).pop()}
                      </span>
                    ))}
                    {outEdges.length > 3 && (
                      <span className="text-[10px] text-slate-500">+{outEdges.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
