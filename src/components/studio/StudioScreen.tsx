/**
 * REACTFLOW - Studio Screen (Batch 1 & Batch 2)
 * Full Pause-and-React Session Engine, Audio Setup, Layout Editor,
 * Front-Camera Recording, and Video Playback.
 * Created by Engineer Daniel Nwalor
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Upload,
  AlertCircle,
  Film,
  Sparkles,
  Maximize,
  FastForward,
  Rewind,
  MonitorSmartphone,
  Headphones,
  Layout,
  Camera,
  CameraOff,
  Mic,
  Video,
  CheckCircle2,
  ListVideo,
  Sliders,
  Radio,
  StopCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AspectRatioType } from '../../types/project';
import { AudioSetupModal } from './AudioSetupModal';
import { LayoutEditorModal } from './LayoutEditorModal';
import { SessionSummaryModal } from './SessionSummaryModal';
import { SegmentReviewModal } from './SegmentReviewModal';
import { FacecamOverlay } from './FacecamOverlay';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const StudioScreen: React.FC = () => {
  const {
    activeProject,
    videoSrc,
    videoFileName,
    isVideoLoading,
    videoError,
    setVideoError,
    videoRef,
    updateActiveProjectPosition,
    updateActiveProjectAspectRatio,
    relinkVideoToProject,
    createNewProject,
    settings,
    deviceOrientation,

    // Batch 2 Audio & Layout
    setIsAudioSetupModalOpen,
    setIsLayoutEditorOpen,
    audioConfig,
    layout,

    // Batch 2 Camera & Session Engine
    sessionState,
    recordingMode,
    setRecordingMode,
    recordingQuality,
    setRecordingQuality,
    isCameraPreviewActive,
    toggleCameraPreview,
    startLiveSession,
    pauseAndReact,
    stopReaction,
    resumeVideo,
    finishSession,
    cameraError,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const relinkInputRef = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const seekInterval = settings.seekInterval || 5;
  const currentAspectRatio: AspectRatioType = activeProject?.aspectRatio || 'fit';

  // Restore playback position when video metadata is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const targetPosition = activeProject?.lastPlaybackPosition || 0;
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setVideoDimensions({
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      });

      if (targetPosition > 0 && targetPosition < video.duration) {
        video.currentTime = targetPosition;
        setCurrentTime(targetPosition);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoSrc, activeProject?.id, activeProject?.lastPlaybackPosition, videoRef]);

  // Sync video time updates
  const handleTimeUpdate = () => {
    if (isSeeking || !videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
  };

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().catch((err) => {
        setVideoError('Could not start playback: ' + err.message);
      });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
      updateActiveProjectPosition(video.currentTime);
    }
  }, [setVideoError, updateActiveProjectPosition, videoRef]);

  // Handle Seek scrubbing
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setIsSeeking(false);
    if (videoRef.current) {
      updateActiveProjectPosition(videoRef.current.currentTime);
    }
  };

  const handleStep = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
    video.currentTime = newTime;
    setCurrentTime(newTime);
    updateActiveProjectPosition(newTime);
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    updateActiveProjectPosition(0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (sessionState === 'playing_source') {
          pauseAndReact();
        } else {
          handlePlayPause();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStep(-seekInterval);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStep(seekInterval);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, pauseAndReact, sessionState, seekInterval]);

  const cycleAspectRatio = () => {
    const options: AspectRatioType[] = ['16:9', '9:16', '1:1', 'fit'];
    const nextIdx = (options.indexOf(currentAspectRatio) + 1) % options.length;
    updateActiveProjectAspectRatio(options[nextIdx]);
  };

  const getAspectRatioClasses = (): string => {
    switch (currentAspectRatio) {
      case '16:9':
        return 'aspect-video max-h-[55vh]';
      case '9:16':
        return 'aspect-[9/16] max-h-[60vh] mx-auto';
      case '1:1':
        return 'aspect-square max-h-[50vh] mx-auto';
      case 'fit':
      default:
        return 'max-h-[55vh] w-full';
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await createNewProject(file.name.replace(/\.[^/.]+$/, ''), file);
    }
  };

  const handleRelinkFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeProject && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await relinkVideoToProject(activeProject.id, file);
    }
  };

  const isLandscape = deviceOrientation === 'landscape';
  const reactionSegments = activeProject?.reactionSegments || [];

  return (
    <div
      className={`flex-1 overflow-y-auto text-neutral-100 flex flex-col ${
        isLandscape ? 'p-2' : 'p-3 sm:p-4'
      } max-w-4xl mx-auto w-full`}
    >
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileImport} className="hidden" />
      <input ref={relinkInputRef} type="file" accept="video/*" onChange={handleRelinkFile} className="hidden" />

      {videoSrc ? (
        <div className="flex-1 flex flex-col space-y-3">
          {/* STUDIO TOP TOOLBAR (Audio Setup, Layout Editor, Camera Toggle) */}
          <div className="flex items-center justify-between px-1 text-xs gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-[220px]">
                {activeProject?.name || 'Reaction Session'}
              </span>
            </div>

            {/* Action buttons strip */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Audio Setup Button */}
              <button
                onClick={() => setIsAudioSetupModalOpen(true)}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Configure audio output & microphone"
              >
                <Headphones className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden xs:inline">Audio Setup</span>
              </button>

              {/* Layout Editor Button */}
              <button
                onClick={() => setIsLayoutEditorOpen(true)}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Customize Facecam layout & shapes"
              >
                <Layout className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden xs:inline">Layout</span>
              </button>

              {/* Live Camera Preview Toggle */}
              <button
                onClick={toggleCameraPreview}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCameraPreviewActive
                    ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
                title="Toggle live camera preview"
              >
                {isCameraPreviewActive ? (
                  <>
                    <Camera className="w-3.5 h-3.5 text-sky-400" />
                    <span>Live Cam On</span>
                  </>
                ) : (
                  <>
                    <CameraOff className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Live Cam Off</span>
                  </>
                )}
              </button>

              {/* Aspect Ratio */}
              <button
                onClick={cycleAspectRatio}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
                title="Change aspect ratio"
              >
                <span>{currentAspectRatio.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* MAIN COMPOSITION VIEWPORT (VIDEO + DRAGGABLE FACECAM OVERLAY) */}
          <div
            ref={videoContainerRef}
            className="relative bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center min-h-[220px]"
          >
            {/* Buffering/Loading Indicator */}
            {(isVideoLoading || isBuffering) && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <span className="mt-2 text-xs text-neutral-300 font-medium">
                  {isVideoLoading ? 'Loading media stream...' : 'Buffering...'}
                </span>
              </div>
            )}

            {/* Base Source Video Player */}
            <video
              ref={videoRef}
              src={videoSrc}
              className={`w-full object-contain ${getAspectRatioClasses()} transition-all`}
              onPlay={() => setIsPlaying(true)}
              onPause={() => {
                setIsPlaying(false);
                if (videoRef.current) {
                  updateActiveProjectPosition(videoRef.current.currentTime);
                }
              }}
              onTimeUpdate={handleTimeUpdate}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onEnded={() => {
                setIsPlaying(false);
                if (videoRef.current) {
                  updateActiveProjectPosition(videoRef.current.currentTime);
                }
              }}
              onError={(e) => {
                console.error('Video error event:', e);
                setVideoError('Video playback error or unsupported format.');
                setIsBuffering(false);
              }}
              playsInline
              onClick={handlePlayPause}
            />

            {/* Real Customizable Facecam Overlay */}
            <FacecamOverlay containerRef={videoContainerRef} />

            {/* Tap-to-play overlay button when paused and idle */}
            {!isPlaying && !isVideoLoading && !isBuffering && sessionState === 'idle' && (
              <button
                onClick={handlePlayPause}
                className="absolute z-10 w-16 h-16 rounded-full bg-sky-500/90 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                aria-label="Play video"
              >
                <Play className="w-7 h-7 fill-current ml-1" />
              </button>
            )}
          </div>

          {/* Error Banner if any */}
          {(videoError || cameraError) && (
            <div className="rounded-xl bg-red-950/60 border border-red-800/80 p-3 flex items-start gap-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-300">{videoError || cameraError}</p>
                {videoError && (
                  <button
                    onClick={() => relinkInputRef.current?.click()}
                    className="mt-1 underline font-semibold text-white hover:text-red-100"
                  >
                    Locate and re-select source video file
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CORE LIVE REACTION SESSION ENGINE CONTROLS */}
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-3.5 space-y-3 shadow-lg">
            {/* Session Action Control Buttons */}
            <div className="flex items-center justify-between gap-2">
              {sessionState === 'idle' ? (
                /* Idle state: Prominent Start Session CTA */
                <button
                  onClick={startLiveSession}
                  className="flex-1 min-h-[50px] rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>START LIVE REACTION SESSION</span>
                </button>
              ) : sessionState === 'playing_source' ? (
                /* Playing source state: PAUSE & REACT CTA */
                <div className="flex-1 flex items-center gap-2">
                  <button
                    onClick={pauseAndReact}
                    className="flex-1 min-h-[50px] rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-98 transition-all cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white animate-ping" />
                    <span>PAUSE & REACT</span>
                  </button>

                  <button
                    onClick={finishSession}
                    className="min-h-[50px] px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                  >
                    Finish
                  </button>
                </div>
              ) : sessionState === 'recording_reaction' ? (
                /* Recording reaction state: STOP REACTION CTA */
                <button
                  onClick={stopReaction}
                  className="flex-1 min-h-[50px] rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <StopCircle className="w-5 h-5 fill-current" />
                  <span>STOP REACTION & SAVE TAKE</span>
                </button>
              ) : sessionState === 'paused_between_segments' ? (
                /* Paused between segments: RESUME VIDEO CTA */
                <div className="flex-1 flex items-center gap-2">
                  <button
                    onClick={resumeVideo}
                    className="flex-1 min-h-[50px] rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                    <span>RESUME VIDEO</span>
                  </button>

                  <button
                    onClick={finishSession}
                    className="min-h-[50px] px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                  >
                    Finish Session
                  </button>
                </div>
              ) : (
                <div className="flex-1 py-2 text-center text-xs text-neutral-400">
                  Processing session state...
                </div>
              )}
            </div>

            {/* Standard Seek Bar & Timestamps */}
            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                onTouchStart={handleSeekMouseDown}
                onTouchEnd={handleSeekMouseUp}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
                aria-label="Video seek position"
              />

              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-0.5">
                <span className="text-white font-medium">{formatTime(currentTime)}</span>
                <span className="text-neutral-500">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls Strip */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-800/80">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleRestart}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  title="Restart video"
                  aria-label="Restart video"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleStep(-seekInterval)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  title={`Step back ${seekInterval}s`}
                  aria-label={`Step back ${seekInterval}s`}
                >
                  <Rewind className="w-4 h-4" />
                </button>
              </div>

              {/* Play / Pause Toggle */}
              <button
                onClick={handlePlayPause}
                className="w-11 h-11 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-all"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStep(seekInterval)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  title={`Step forward ${seekInterval}s`}
                  aria-label={`Step forward ${seekInterval}s`}
                >
                  <FastForward className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleMute}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Session Reaction Takes Status Bar */}
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <ListVideo className="w-4 h-4 text-sky-400" />
              <span>
                Saved Takes: <strong className="text-white">{reactionSegments.length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {reactionSegments.length > 0 && (
                <button
                  onClick={finishSession}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  View Session Summary
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sky-400 shadow-xl">
            <Film className="w-8 h-8 stroke-[1.8]" />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h2 className="text-lg font-bold text-white">Studio Workspace Ready</h2>
            <p className="text-xs text-neutral-400">
              Import a video from your device or load a demo video to begin live reaction recording.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full max-w-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[48px] rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import Local Video</span>
            </button>

            <button
              onClick={() => createNewProject('Demo Reaction Session', undefined, 'tech')}
              className="w-full min-h-[48px] rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Load Instant Demo Video</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AudioSetupModal />
      <LayoutEditorModal />
      <SessionSummaryModal />
      <SegmentReviewModal />
    </div>
  );
};
