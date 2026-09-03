'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Settings, Key, Sparkles, Database, Save, Check, HardDrive, Bell, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
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
        subtitle="Manage theme appearance, AI engine parameters, API credentials, and cloud storage providers"
      />

      <div className="px-8 pt-8 space-y-8 max-w-4xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Appearance & Theme Customization */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sun className="w-5 h-5 text-foreground" />
              <span>Appearance & Color Mode</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Choose your preferred interface theme. Designed in a refined, high-contrast monochrome aesthetic.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Dark Option */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  theme === 'dark'
                    ? 'border-foreground bg-foreground/10 text-foreground ring-1 ring-foreground'
                    : 'border-border bg-background hover:bg-surface-hover text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Moon className="w-5 h-5 text-foreground" />
                  {theme === 'dark' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">Dark Mode</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Deep obsidian & zinc</div>
                </div>
              </button>

              {/* Light Option */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  theme === 'light'
                    ? 'border-foreground bg-foreground/10 text-foreground ring-1 ring-foreground'
                    : 'border-border bg-background hover:bg-surface-hover text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Sun className="w-5 h-5 text-foreground" />
                  {theme === 'light' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">Light Mode</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Crisp paper white & charcoal</div>
                </div>
              </button>

              {/* System Option */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  theme === 'system'
                    ? 'border-foreground bg-foreground/10 text-foreground ring-1 ring-foreground'
                    : 'border-border bg-background hover:bg-surface-hover text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Laptop className="w-5 h-5 text-foreground" />
                  {theme === 'system' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">System Default</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Sync with OS appearance</div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Remediation Engine Configuration */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-foreground" />
              <span>AI Remediation & Patch Synthesis Provider</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Select the LLM provider used to generate unified diff patches and vulnerability explanations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  AI Model Provider:
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full bg-background border border-border text-foreground text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-foreground transition-colors"
                >
                  <option value="local">Deterministic Rule Synthesis (Offline / Zero-latency)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="gemini">Google Gemini 1.5 / 2.0</option>
                  <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                  <option value="ollama">Ollama Local LLM (http://localhost:11434)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Model Identifier:
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-background border border-border text-foreground text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-foreground font-mono transition-colors"
                />
              </div>
            </div>

            {aiProvider !== 'local' && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  API Key:
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-background border border-border text-foreground text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-foreground font-mono transition-colors"
                />
              </div>
            )}
          </div>

          {/* Storage Driver */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-foreground" />
              <span>Artifact Storage & PDF Archive</span>
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground block">Storage Backend:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setStorageDriver('local')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    storageDriver === 'local'
                      ? 'border-foreground bg-foreground/10 text-foreground ring-1 ring-foreground'
                      : 'border-border bg-background hover:bg-surface-hover text-muted-foreground'
                  }`}
                >
                  <div className="font-bold text-xs text-foreground">Local Filesystem Storage</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Stored in local ./uploads folder</div>
                </div>

                <div
                  onClick={() => setStorageDriver('s3')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    storageDriver === 's3'
                      ? 'border-foreground bg-foreground/10 text-foreground ring-1 ring-foreground'
                      : 'border-border bg-background hover:bg-surface-hover text-muted-foreground'
                  }`}
                >
                  <div className="font-bold text-xs text-foreground">Amazon S3 / MinIO Cloud Storage</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Encrypted S3 bucket artifact persistence</div>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Management */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Key className="w-5 h-5 text-foreground" />
              <span>CI/CD & CLI Access Tokens</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Use API tokens in GitHub Actions, GitLab CI, or Jenkins to run automated quality gates on pull requests.
            </p>

            <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between font-mono text-xs text-foreground">
              <span>aps_live_948f293b48201a9df823091e847</span>
              <button
                type="button"
                onClick={() => alert('API Key copied to clipboard')}
                className="text-xs text-foreground hover:opacity-80 font-sans font-bold underline"
              >
                Copy Key
              </button>
            </div>
          </div>

          {/* Save CTA */}
          <div className="flex items-center justify-end gap-3">
            {isSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" />
                <span>Configuration saved successfully</span>
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 bg-foreground text-background hover:opacity-90 text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
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
