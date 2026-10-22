/**
 * REACTFLOW - Session Summary Modal (Milestone M7 Section G)
 * Displays actual recorded reaction segments, duration metrics, and project review actions.
 * Created by Engineer Daniel Nwalor
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Film,
  Clock,
  Play,
  RotateCcw,
  ArrowRight,
  Layers,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { ReactionSegment } from '../../types/project';

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const SessionSummaryModal: React.FC = () => {
  const { sessionSummaryData, closeSessionSummary, navigateTo, discardReactionSegment } = useApp();
  const [playingSegment, setPlayingSegment] = useState<ReactionSegment | null>(null);

  if (!sessionSummaryData) return null;

  const { project, segments, totalDuration } = sessionSummaryData;

  const handleReturnHome = () => {
    closeSessionSummary();
    navigateTo('home');
  };

  const handleReviewProject = () => {
    closeSessionSummary();
    navigateTo('studio');
  };

  return (
    <Modal
      isOpen={!!sessionSummaryData}
      onClose={closeSessionSummary}
      title="Reaction Session Summary"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 text-neutral-100 max-h-[75vh] overflow-y-auto pr-1">
        {/* Success Header Card */}
        <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Live Reaction Recorded</h3>
            <p className="text-xs text-neutral-400 truncate max-w-sm mx-auto">
              {project.sourceVideoName || project.name}
            </p>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-400 block mb-1">Segments</span>
            <span className="text-lg font-bold font-mono text-white">{segments.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-400 block mb-1">Reaction Time</span>
            <span className="text-lg font-bold font-mono text-sky-400">
              {formatDuration(totalDuration)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-400 block mb-1">Status</span>
            <span className="text-xs font-semibold text-emerald-400 block mt-1">Saved</span>
          </div>
        </div>

        {/* Recorded Segments List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
            Saved Reaction Takes ({segments.length})
          </span>

          {segments.length === 0 ? (
            <div className="p-4 rounded-xl bg-neutral-950 text-center text-xs text-neutral-500">
              No reaction takes were recorded in this session.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {segments.map((seg, idx) => (
                <div
                  key={seg.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">
                        Take at video {formatDuration(seg.sourceVideoTimestamp)}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Duration: {formatDuration(seg.duration)} · {seg.mode === 'voice_only' ? 'Voice Commentary' : 'Front Camera'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setPlayingSegment(seg)}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-sky-400 text-xs flex items-center gap-1 transition-colors"
                      title="Preview reaction take"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Preview Popup for Take */}
        {playingSegment && (
          <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Previewing Reaction Take</span>
              <button
                onClick={() => setPlayingSegment(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {playingSegment.mode === 'camera' ? (
              <video
                src={playingSegment.mediaUri}
                controls
                autoPlay
                className="w-full max-h-44 rounded-lg bg-black object-contain"
              />
            ) : (
              <audio
                src={playingSegment.mediaUri}
                controls
                autoPlay
                className="w-full"
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            onClick={handleReturnHome}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
          >
            Return to Home
          </button>

          <button
            onClick={handleReviewProject}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>Review in Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
