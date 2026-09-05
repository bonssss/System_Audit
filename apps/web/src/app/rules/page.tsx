'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { STANDARD_RULES } from '@ai-scanner/shared';
import { ShieldCheck, Search, Tag, Clock, ExternalLink } from 'lucide-react';
import { getSeverityColor } from '@/lib/utils';

export default function RulesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const rulesList = Object.values(STANDARD_RULES);

  const filtered = rulesList.filter((r) => {
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.cwe && r.cwe.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col pb-16">
      <Header
        title="Security & Architecture Rules Catalog"
        subtitle="Explore built-in OWASP Top 10, CWE vulnerability rules, and automated remediations"
      />

      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 max-w-7xl">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-border p-4 rounded-2xl shadow-sm transition-colors">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rules, CWE IDs, or categories..."
              className="w-full bg-background border border-border text-foreground text-xs pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-background border border-border text-foreground text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="ALL">All Rule Categories</option>
            <option value="SECURITY">Security</option>
            <option value="CODE_QUALITY">Code Quality</option>
            <option value="COMPLEXITY">Complexity</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="ARCHITECTURE">Architecture</option>
            <option value="DOCKER">Docker</option>
            <option value="KUBERNETES">Kubernetes</option>
          </select>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((rule) => {
            const sevColor = getSeverityColor(rule.severity);

            return (
              <div
                key={rule.id}
                className="clean-card p-6 shadow-sm flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${sevColor.badge}`}>
                      {rule.severity}
                    </span>
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {rule.id} {rule.cwe ? `• ${rule.cwe}` : ''}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-1">{rule.name}</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{rule.description}</p>

                  {/* Recommendation Box */}
                  <div className="mt-4 p-3 rounded-xl bg-muted border border-border text-xs text-foreground">
                    <strong className="block text-muted-foreground mb-1 text-[11px] font-bold uppercase tracking-wider">
                      Recommended Fix:
                    </strong>
                    {rule.recommendation}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Effort: {rule.effort}</span>
                  </span>

                  <span className="bg-muted text-foreground border border-border px-2 py-0.5 rounded text-[10px] font-mono">
                    {rule.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
