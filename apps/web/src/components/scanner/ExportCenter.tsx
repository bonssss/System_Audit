'use client';

import React, { useState } from 'react';
import { Download, FileText, FileCode, Sheet, Globe, Check, Sparkles } from 'lucide-react';

interface ExportCenterProps {
  scanId: string;
  projectName: string;
}

export function ExportCenter({ scanId, projectName }: ExportCenterProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (format: 'HTML' | 'PDF' | 'JSON' | 'CSV') => {
    setDownloading(format);
    try {
      window.open(`/api/reports/${scanId}/download?format=${format}`, '_blank');
    } catch {
      // ignore
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-400" />
          <span>Compliance & Audit Export Center</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate and download executive-level, CI/CD, and compliance audit packages for {projectName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Interactive HTML Report */}
        <div className="bg-[#141d33] border border-[#1e2d4d] rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Interactive HTML Report</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Self-contained offline dynamic audit dashboard with live search, filters, and code highlights.
            </p>
          </div>
          <button
            onClick={() => handleDownload('HTML')}
            disabled={downloading === 'HTML'}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'HTML' ? 'Downloading...' : 'Export HTML'}</span>
          </button>
        </div>

        {/* Printable PDF Audit Report */}
        <div className="bg-[#141d33] border border-[#1e2d4d] rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Printable Executive PDF</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Formal audit document formatted for executive review, compliance sign-offs, and stakeholders.
            </p>
          </div>
          <button
            onClick={() => handleDownload('PDF')}
            disabled={downloading === 'PDF'}
            className="mt-4 w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-rose-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'PDF' ? 'Downloading...' : 'Export PDF'}</span>
          </button>
        </div>

        {/* Machine-Readable JSON Export */}
        <div className="bg-[#141d33] border border-[#1e2d4d] rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Raw JSON / SARIF Payload</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Full machine-readable scan payload for integration into SonarQube, GitHub Code Scanning, or CI/CD.
            </p>
          </div>
          <button
            onClick={() => handleDownload('JSON')}
            disabled={downloading === 'JSON'}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'JSON' ? 'Downloading...' : 'Export JSON'}</span>
          </button>
        </div>

        {/* Spreadsheet CSV Export */}
        <div className="bg-[#141d33] border border-[#1e2d4d] rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Sheet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Issue Tracker CSV</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Tabular spreadsheet containing all findings, CWE tags, line coordinates, and remediation effort.
            </p>
          </div>
          <button
            onClick={() => handleDownload('CSV')}
            disabled={downloading === 'CSV'}
            className="mt-4 w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-amber-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'CSV' ? 'Downloading...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
