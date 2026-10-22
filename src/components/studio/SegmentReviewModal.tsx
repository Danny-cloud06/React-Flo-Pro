/**
 * REACTFLOW - Segment Review Modal (Milestone M6 Section E)
 * Lets creators review their newly captured reaction take before resuming the video.
 * Created by Engineer Daniel Nwalor
 */

import React, { useState } from 'react';
import { Play, Pause, Check, Trash2, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const SegmentReviewModal: React.FC = () => {
  const { reviewingSegment, setReviewingSegment, resumeVideo, discardReactionSegment } = useApp();
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  if (!reviewingSegment) return null;

  const handleKeepAndResume = () => {
    setReviewingSegment(null);
    resumeVideo();
  };

  const handleConfirmDiscard = async () => {
    await discardReactionSegment(reviewingSegment.id);
    setShowDiscardConfirm(false);
    setReviewingSegment(null);
  };

  return (
    <Modal
      isOpen={!!reviewingSegment}
      onClose={() => setReviewingSegment(null)}
      title="Reaction Take Review"
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-neutral-100">
        {/* Media Preview Box */}
        <div className="rounded-xl overflow-hidden bg-black border border-neutral-800 flex items-center justify-center min-h-[180px]">
          {reviewingSegment.mode === 'camera' ? (
            <video
              src={reviewingSegment.mediaUri}
              controls
              autoPlay
              className="w-full max-h-56 object-contain"
            />
          ) : (
            <div className="p-6 text-center space-y-3 w-full">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">
                Voice Commentary Take
              </span>
              <audio src={reviewingSegment.mediaUri} controls autoPlay className="w-full" />
            </div>
          )}
        </div>

        {/* Take Meta details */}
        <div className="flex items-center justify-between text-xs text-neutral-400 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
          <div>
            <span className="text-neutral-500 block">Paused At Video Position</span>
            <span className="font-mono text-white font-semibold">
              {formatDuration(reviewingSegment.sourceVideoTimestamp)}
            </span>
          </div>

          <div>
            <span className="text-neutral-500 block">Take Duration</span>
            <span className="font-mono text-sky-400 font-semibold">
              {formatDuration(reviewingSegment.duration)}
            </span>
          </div>
        </div>

        {/* Discard confirmation sub-view */}
        {showDiscardConfirm ? (
          <div className="rounded-xl bg-red-950/50 border border-red-800/80 p-3.5 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p>Discard this reaction take permanently? This cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="min-h-[38px] px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                Confirm Discard
              </button>
            </div>
          </div>
        ) : (
          /* Primary Actions */
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={() => setShowDiscardConfirm(true)}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Discard Take</span>
            </button>

            <button
              onClick={handleKeepAndResume}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Keep & Resume Video</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
