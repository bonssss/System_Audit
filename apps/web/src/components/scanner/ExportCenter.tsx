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
    <div className="clean-card rounded-2xl p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Download className="w-5 h-5 text-foreground" />
          <span>Compliance & Audit Export Center</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate and download executive-level, CI/CD, and compliance audit packages for {projectName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Interactive HTML Report */}
        <div className="bg-background border border-border rounded-xl p-5 flex flex-col justify-between hover:border-foreground transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Interactive HTML Report</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Self-contained offline dynamic audit dashboard with live search, filters, and code highlights.
            </p>
          </div>
          <button
            onClick={() => handleDownload('HTML')}
            disabled={downloading === 'HTML'}
            className="mt-4 w-full bg-foreground text-background hover:opacity-90 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'HTML' ? 'Downloading...' : 'Export HTML'}</span>
          </button>
        </div>

        {/* Printable PDF Audit Report */}
        <div className="bg-background border border-border rounded-xl p-5 flex flex-col justify-between hover:border-foreground transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Printable Executive PDF</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Formal audit document formatted for executive review, compliance sign-offs, and stakeholders.
            </p>
          </div>
          <button
            onClick={() => handleDownload('PDF')}
            disabled={downloading === 'PDF'}
            className="mt-4 w-full bg-foreground text-background hover:opacity-90 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'PDF' ? 'Downloading...' : 'Export PDF'}</span>
          </button>
        </div>

        {/* Machine-Readable JSON Export */}
        <div className="bg-background border border-border rounded-xl p-5 flex flex-col justify-between hover:border-foreground transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Raw JSON / SARIF Payload</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Full machine-readable scan payload for integration into SonarQube, GitHub Code Scanning, or CI/CD.
            </p>
          </div>
          <button
            onClick={() => handleDownload('JSON')}
            disabled={downloading === 'JSON'}
            className="mt-4 w-full bg-foreground text-background hover:opacity-90 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'JSON' ? 'Downloading...' : 'Export JSON'}</span>
          </button>
        </div>

        {/* Spreadsheet CSV Export */}
        <div className="bg-background border border-border rounded-xl p-5 flex flex-col justify-between hover:border-foreground transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center mb-3">
              <Sheet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Issue Tracker CSV</h4>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Tabular spreadsheet containing all findings, CWE tags, line coordinates, and remediation effort.
            </p>
          </div>
          <button
            onClick={() => handleDownload('CSV')}
            disabled={downloading === 'CSV'}
            className="mt-4 w-full bg-foreground text-background hover:opacity-90 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'CSV' ? 'Downloading...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
