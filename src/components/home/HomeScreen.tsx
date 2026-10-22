/**
 * REACTFLOW - Home Screen
 * Created by Engineer Daniel Nwalor
 */

import React, { useState, useRef } from 'react';
import {
  Play,
  Plus,
  Clapperboard,
  Settings,
  Clock,
  Film,
  Sparkles,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Project } from '../../types/project';

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export const HomeScreen: React.FC = () => {
  const {
    projects,
    activeProject,
    openProject,
    createNewProject,
    navigateTo,
  } = useApp();

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleChoice, setSampleChoice] = useState<'custom' | 'tech' | 'nature'>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenNewModal = () => {
    setProjectName(`Reaction #${projects.length + 1}`);
    setSelectedFile(null);
    setSampleChoice('custom');
    setIsNewProjectModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSampleChoice('custom');
      if (!projectName || projectName.startsWith('Reaction #')) {
        setProjectName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (sampleChoice === 'custom' && selectedFile) {
        await createNewProject(projectName, selectedFile);
      } else if (sampleChoice === 'tech' || sampleChoice === 'nature') {
        await createNewProject(projectName, undefined, sampleChoice);
      } else {
        // Fallback default sample clip
        await createNewProject(projectName, undefined, 'tech');
      }
      setIsNewProjectModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find unfinished project or active project for "CONTINUE PROJECT"
  const continueProject: Project | undefined =
    activeProject || (projects.length > 0 ? projects[0] : undefined);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 text-neutral-100 max-w-xl mx-auto w-full">
      {/* Brand Hero */}
      <section className="space-y-1 pt-1">
        <div className="flex items-center gap-3">
          <img
            src="/app-icon.jpg"
            alt="REACTFLOW Icon"
            className="w-10 h-10 rounded-xl shadow-md border border-sky-500/30 object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              REACTFLOW
            </h1>
            <p className="text-xs text-neutral-400">
              Your space for authentic live reactions.
            </p>
          </div>
        </div>
      </section>

      {/* Prominent NEW REACTION CTA Button */}
      <section>
        <button
          onClick={handleOpenNewModal}
          className="w-full min-h-[52px] rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>NEW REACTION</span>
        </button>
      </section>

      {/* CONTINUE PROJECT Section */}
      {continueProject && (
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 tracking-wider uppercase">
            <span>Continue Project</span>
            <span className="text-neutral-500 text-[11px] font-normal normal-case">
              Last modified {formatDate(continueProject.updatedAt)}
            </span>
          </div>

          <div
            onClick={() => openProject(continueProject.id)}
            className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-4 hover:border-neutral-700 transition-all cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-sky-400 shrink-0" />
                  <h3 className="font-semibold text-white text-base truncate">
                    {continueProject.name}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 truncate">
                  {continueProject.sourceVideoName || 'Imported Video'}
                </p>

                <div className="flex items-center gap-3 pt-2 text-xs text-neutral-400">
                  <span className="flex items-center gap-1 font-mono text-neutral-300">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    {formatDuration(continueProject.lastPlaybackPosition)} / {formatDuration(continueProject.sourceVideoDuration)}
                  </span>
                  <span>·</span>
                  <span className="capitalize text-neutral-300 font-medium">
                    {continueProject.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-all">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Playback progress bar */}
            {continueProject.sourceVideoDuration > 0 && (
              <div className="mt-3 w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (continueProject.lastPlaybackPosition / continueProject.sourceVideoDuration) * 100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Shortcuts to Studio and Settings */}
      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigateTo('studio')}
          className="min-h-[72px] p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-neutral-400 group-hover:text-sky-400 transition-colors">
            <Clapperboard className="w-5 h-5" />
            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Studio</div>
            <div className="text-[11px] text-neutral-400">Video Player Workspace</div>
          </div>
        </button>

        <button
          onClick={() => navigateTo('settings')}
          className="min-h-[72px] p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-neutral-400 group-hover:text-neutral-200 transition-colors">
            <Settings className="w-5 h-5" />
            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Settings</div>
            <div className="text-[11px] text-neutral-400">Preferences & Storage</div>
          </div>
        </button>
      </section>

      {/* RECENT PROJECTS Section or Empty State */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 tracking-wider uppercase">
          <span>Recent Projects</span>
          {projects.length > 0 && (
            <button
              onClick={() => navigateTo('projects')}
              className="text-sky-400 hover:text-sky-300 text-xs normal-case font-medium flex items-center gap-1"
            >
              View all ({projects.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center mx-auto text-neutral-400">
              <Film className="w-6 h-6 stroke-[1.7]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">No reaction projects yet</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Import a video to begin your first live reaction recording session.
              </p>
            </div>
            <button
              onClick={handleOpenNewModal}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Import Video to Start</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                onClick={() => openProject(proj.id)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700 transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-medium text-white text-sm truncate">{proj.name}</div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5 truncate">
                    <span className="truncate">{proj.sourceVideoName}</span>
                    <span>·</span>
                    <span className="font-mono text-[11px] shrink-0">
                      {formatDuration(proj.sourceVideoDuration)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {formatDate(proj.updatedAt)}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New Reaction Modal */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Start New Reaction Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Music Video Live Reaction"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Select Source Video
            </label>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Custom file upload card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${
                sampleChoice === 'custom' && selectedFile
                  ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                  : 'border-neutral-700 bg-neutral-950/60 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
              }`}
            >
              <Upload className="w-6 h-6 mx-auto mb-1.5 text-neutral-300" />
              {selectedFile ? (
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-white truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · Ready to load
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-white">Choose local video file</p>
                  <p className="text-[11px] text-neutral-500">Supports MP4, WebM, MKV, MOV</p>
                </div>
              )}
            </div>

            {/* Built-in sample video choices for instant testing */}
            <div className="pt-2">
              <span className="text-[11px] text-neutral-400 block mb-1.5">
                Or pick an instant test video:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSampleChoice('tech');
                    setSelectedFile(null);
                    setProjectName('Demo - Big Buck Bunny Reaction');
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-left border text-xs transition-all ${
                    sampleChoice === 'tech'
                      ? 'border-sky-500 bg-sky-500/15 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <div className="font-semibold truncate">Bunny Animation</div>
                  <div className="text-[10px] text-neutral-400">Standard test clip</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSampleChoice('nature');
                    setSelectedFile(null);
                    setProjectName('Demo - Big Blaze Reaction');
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-left border text-xs transition-all ${
                    sampleChoice === 'nature'
                      ? 'border-sky-500 bg-sky-500/15 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <div className="font-semibold truncate">Nature Clip</div>
                  <div className="text-[10px] text-neutral-400">Fast 15s HD video</div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Open in Studio'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
