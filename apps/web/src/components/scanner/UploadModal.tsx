'use client';

import React, { useState } from 'react';
import { UploadCloud, Github, Box, Sparkles, X, FileArchive, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanStarted?: (scanId: string) => void;
}

export function UploadModal({ isOpen, onClose, onScanStarted }: UploadModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ZIP' | 'GITHUB'>('ZIP');
  const [projectName, setProjectName] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (activeTab === 'ZIP') {
        if (!selectedFile) throw new Error('Please select a .zip archive');
        const formData = new FormData();
        formData.append('projectName', projectName || selectedFile.name.replace(/\.zip$/i, ''));
        formData.append('file', selectedFile);

        const res = await fetch('/api/scan', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        onClose();
        if (onScanStarted) onScanStarted(data.data.scanId);
        router.push(`/scans/${data.data.scanId}`);
      } else if (activeTab === 'GITHUB') {
        if (!gitUrl) throw new Error('Please enter a valid Git repository URL');
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gitUrl, projectName }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        onClose();
        if (onScanStarted) onScanStarted(data.data.scanId);
        router.push(`/scans/${data.data.scanId}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start scan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in">
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1f2937] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              New Security Scan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your source code ZIP or enter a Git repository URL.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#1f2937] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-[#0b0f19] border-b border-[#1f2937] text-xs font-medium">
          <button
            onClick={() => setActiveTab('ZIP')}
            className={`py-1.5 rounded-md transition-colors ${
              activeTab === 'ZIP'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload ZIP Archive
          </button>

          <button
            onClick={() => setActiveTab('GITHUB')}
            className={`py-1.5 rounded-md transition-colors ${
              activeTab === 'GITHUB'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Git Repository
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {activeTab === 'ZIP' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Project Title (Optional):
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. My Next.js Web App"
                  className="w-full bg-[#0b0f19] border border-[#1f2937] text-slate-200 text-xs px-3 py-2 rounded-md focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  ZIP Archive:
                </label>
                <label className="border border-dashed border-[#1f2937] hover:border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-[#0b0f19] transition-colors">
                  <FileArchive className="w-6 h-6 text-indigo-400 mb-2" />
                  <span className="text-xs font-medium text-slate-300">
                    {selectedFile ? selectedFile.name : 'Click to select .zip archive'}
                  </span>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'GITHUB' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Project Title (Optional):
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Backend API"
                  className="w-full bg-[#0b0f19] border border-[#1f2937] text-slate-200 text-xs px-3 py-2 rounded-md focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Repository Git URL:
                </label>
                <input
                  type="text"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/org/repo.git"
                  className="w-full bg-[#0b0f19] border border-[#1f2937] text-slate-200 text-xs px-3 py-2 rounded-md focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#1f2937] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-[#1f2937] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
            >
              <span>{isSubmitting ? 'Scanning...' : 'Run Audit'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
