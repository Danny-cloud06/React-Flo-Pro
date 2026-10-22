/**
 * REACTFLOW - Settings Screen
 * Structured into General, Video, Storage, and About sections
 * Created by Engineer Daniel Nwalor
 */

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Film,
  HardDrive,
  Info,
  ChevronRight,
  Trash2,
  Download,
  Check,
  Shield,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AspectRatioType } from '../../types/project';
import { getStorageStats } from '../../services/storage';
import { Modal } from '../ui/Modal';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, clearAllData, projects, navigateTo, setIsAudioSetupModalOpen } = useApp();

  const [storageInfo, setStorageInfo] = useState<{ projectCount: number; mediaBytes: number }>({
    projectCount: projects.length,
    mediaBytes: 0,
  });

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let active = true;
    getStorageStats().then((stats) => {
      if (active) setStorageInfo(stats);
    });
    return () => {
      active = false;
    };
  }, [projects]);

  const handleExportBackup = () => {
    setIsExporting(true);
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `reactflow_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmClearStorage = async () => {
    await clearAllData();
    setIsClearModalOpen(false);
    setStorageInfo({ projectCount: 0, mediaBytes: 0 });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 text-neutral-100 max-w-xl mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-xs text-neutral-400">Application preferences & project storage</p>
      </div>

      {/* SECTION 1: GENERAL */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <Palette className="w-3.5 h-3.5 text-sky-400" />
          <span>General</span>
        </div>

        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4">
          {/* Appearance Preference */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-200">Appearance Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark Studio' },
                { id: 'amoled', label: 'AMOLED' },
                { id: 'system', label: 'System' },
              ].map((themeOpt) => (
                <button
                  key={themeOpt.id}
                  onClick={() => updateSettings({ theme: themeOpt.id as any })}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    settings.theme === themeOpt.id
                      ? 'border-sky-500 bg-sky-500/15 text-white font-semibold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  {themeOpt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-3">
            {/* Default Project Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-200">Default Project Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9', label: '16:9 Landscape' },
                  { id: '9:16', label: '9:16 Portrait' },
                  { id: '1:1', label: '1:1 Square' },
                ].map((ratioOpt) => (
                  <button
                    key={ratioOpt.id}
                    onClick={() => updateSettings({ defaultAspectRatio: ratioOpt.id as AspectRatioType })}
                    className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-mono border text-center transition-all ${
                      settings.defaultAspectRatio === ratioOpt.id
                        ? 'border-sky-500 bg-sky-500/15 text-white font-semibold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {ratioOpt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: VIDEO */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <Film className="w-3.5 h-3.5 text-sky-400" />
          <span>Video & Playback</span>
        </div>

        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4">
          {/* Default Preview Preference */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-neutral-200">Preview Scaling Mode</div>
              <div className="text-[11px] text-neutral-500">How source video fits into viewport</div>
            </div>
            <select
              value={settings.defaultPreviewFit}
              onChange={(e) => updateSettings({ defaultPreviewFit: e.target.value as any })}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="contain">Fit to view</option>
              <option value="cover">Fill & crop</option>
              <option value="fill">Exact stretch</option>
            </select>
          </div>

          {/* Seek interval */}
          <div className="flex items-center justify-between gap-3 border-t border-neutral-800 pt-3">
            <div>
              <div className="text-xs font-medium text-neutral-200">Seek Step Interval</div>
              <div className="text-[11px] text-neutral-500">Seconds to jump on step buttons</div>
            </div>
            <select
              value={settings.seekInterval}
              onChange={(e) => updateSettings({ seekInterval: parseInt(e.target.value, 10) })}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="5">5 seconds</option>
              <option value="10">10 seconds</option>
              <option value="15">15 seconds</option>
            </select>
          </div>

          {/* Auto pause on background */}
          <div className="flex items-center justify-between gap-3 border-t border-neutral-800 pt-3">
            <div>
              <div className="text-xs font-medium text-neutral-200">Auto-Pause on Tab Switch</div>
              <div className="text-[11px] text-neutral-500">Safely pause playback when leaving Studio</div>
            </div>
            <button
              onClick={() => updateSettings({ autoPauseOnBackground: !settings.autoPauseOnBackground })}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                settings.autoPauseOnBackground ? 'bg-sky-500' : 'bg-neutral-800'
              }`}
              aria-label="Toggle auto-pause on tab switch"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoPauseOnBackground ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Audio Setup Quick Access */}
          <div className="flex items-center justify-between gap-3 border-t border-neutral-800 pt-3">
            <div>
              <div className="text-xs font-medium text-neutral-200">Audio & Mic Routing</div>
              <div className="text-[11px] text-neutral-500">Independent output & microphone selection</div>
            </div>
            <button
              onClick={() => {
                navigateTo('studio');
                setIsAudioSetupModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              Configure
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: STORAGE */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <HardDrive className="w-3.5 h-3.5 text-sky-400" />
          <span>Project Storage</span>
        </div>

        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <div className="text-base font-bold font-mono text-white">{storageInfo.projectCount}</div>
              <div className="text-[10px] text-neutral-400">Projects</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <div className="text-base font-bold font-mono text-sky-400">
                {(storageInfo as any).segmentCount || 0}
              </div>
              <div className="text-[10px] text-neutral-400">Reaction Takes</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <div className="text-base font-bold font-mono text-white">{formatBytes(storageInfo.mediaBytes)}</div>
              <div className="text-[10px] text-neutral-400">Media Cache</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleExportBackup}
              disabled={projects.length === 0 || isExporting}
              className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export Backup JSON</span>
            </button>

            <button
              onClick={() => setIsClearModalOpen(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: ABOUT */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>About</span>
        </div>

        <div
          onClick={() => navigateTo('about')}
          className="rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">REACTFLOW</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-sky-400">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Created by Engineer Daniel Nwalor
            </p>
            <p className="text-[11px] text-neutral-500">
              Meet the engineer, view philosophy & credits
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-neutral-700 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Reset All Project Data"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            This will permanently erase all saved projects, local video cache, and custom settings.
            Are you sure you want to proceed?
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsClearModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClearStorage}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Erase Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
