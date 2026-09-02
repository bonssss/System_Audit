'use client';

import React, { useState } from 'react';
import { DependencyItem } from '@ai-scanner/shared';
import { PackageSearch, ShieldAlert, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { getSeverityColor } from '@/lib/utils';

interface DependencyTableProps {
  dependencies: DependencyItem[];
}

export function DependencyTable({ dependencies }: DependencyTableProps) {
  const [search, setSearch] = useState('');

  const filtered = dependencies.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.ecosystem.toLowerCase().includes(search.toLowerCase()) ||
    d.vulnerabilities.some((v) => v.cve.toLowerCase().includes(search.toLowerCase()))
  );

  const totalVulns = dependencies.reduce((acc, d) => acc + d.vulnerabilities.length, 0);

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-xl overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-5 border-b border-[#1e293b] flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-indigo-400" />
            <span>Software Bill of Materials (SBOM) & Dependencies</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {dependencies.length} packages scanned • {totalVulns} known CVE vulnerabilities detected
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages or CVE..."
            className="w-full bg-[#161f36] border border-[#223050] text-slate-200 text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0b101d] text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#1e293b]">
            <tr>
              <th className="py-3 px-5 font-semibold">Package Name</th>
              <th className="py-3 px-5 font-semibold">Ecosystem</th>
              <th className="py-3 px-5 font-semibold">Installed Version</th>
              <th className="py-3 px-5 font-semibold">License</th>
              <th className="py-3 px-5 font-semibold">Security Advisories / CVE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                  No dependencies matching search.
                </td>
              </tr>
            ) : (
              filtered.map((dep) => {
                const hasVulns = dep.vulnerabilities.length > 0;

                return (
                  <tr key={dep.id} className="hover:bg-[#131c31] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-100">
                      {dep.name}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-slate-700">
                        {dep.ecosystem}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-300">
                      {dep.currentVersion}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        dep.license === 'GPL-3.0' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {dep.license || 'MIT'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      {hasVulns ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dep.vulnerabilities.map((v, vIdx) => {
                            const sevCol = getSeverityColor(v.severity);
                            return (
                              <span
                                key={vIdx}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${sevCol.badge}`}
                                title={`${v.title} (Fixed in ${v.fixedIn})`}
                              >
                                <ShieldAlert className="w-3 h-3" />
                                <span>{v.cve}</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>No Known Vulnerabilities</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
