'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Settings, Key, Sparkles, Database, Save, Check, HardDrive, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState('local');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4o');
  const [storageDriver, setStorageDriver] = useState('local');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col pb-16">
      <Header
        title="System Settings & Integrations"
        subtitle="Manage AI engine parameters, API credentials, and cloud storage providers"
      />

      <div className="px-8 pt-8 space-y-8 max-w-4xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* AI Remediation Engine Configuration */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Remediation & Patch Synthesis Provider</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select the LLM provider used to generate unified diff patches and vulnerability explanations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  AI Model Provider:
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full bg-[#161f36] border border-[#223050] text-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="local">Deterministic Rule Synthesis (Offline / Zero-latency)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="gemini">Google Gemini 1.5 / 2.0</option>
                  <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                  <option value="ollama">Ollama Local LLM (http://localhost:11434)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Model Identifier:
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-[#161f36] border border-[#223050] text-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {aiProvider !== 'local' && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  API Key:
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-[#161f36] border border-[#223050] text-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Storage Driver */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              <span>Artifact Storage & PDF Archive</span>
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">Storage Backend:</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setStorageDriver('local')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    storageDriver === 'local'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white'
                      : 'bg-[#141d33] border-[#1e2d4d] text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-100">Local Filesystem Storage</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Stored in local ./uploads folder</div>
                </div>

                <div
                  onClick={() => setStorageDriver('s3')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    storageDriver === 's3'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white'
                      : 'bg-[#141d33] border-[#1e2d4d] text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-100">Amazon S3 / MinIO Cloud Storage</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Encrypted S3 bucket artifact persistence</div>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Management */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              <span>CI/CD & CLI Access Tokens</span>
            </h3>
            <p className="text-xs text-slate-400">
              Use API tokens in GitHub Actions, GitLab CI, or Jenkins to run automated quality gates on pull requests.
            </p>

            <div className="p-4 rounded-xl bg-[#0b0f1a] border border-[#1e293b] flex items-center justify-between font-mono text-xs text-slate-300">
              <span>aps_live_948f293b48201a9df823091e847</span>
              <button
                type="button"
                onClick={() => alert('API Key copied to clipboard')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-sans font-bold"
              >
                Copy Key
              </button>
            </div>
          </div>

          {/* Save CTA */}
          <div className="flex items-center justify-end gap-3">
            {isSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" />
                <span>Configuration saved successfully</span>
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
