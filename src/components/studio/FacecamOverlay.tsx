/**
 * REACTFLOW - Live Facecam Overlay Component (Milestones M6, M7, M8)
 * Draggable, resizable, shape-masked camera layer rendered on top of the source video.
 * Created by Engineer Daniel Nwalor
 */

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Mic, Volume2, Move, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const FacecamOverlay: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ containerRef }) => {
  const {
    layout,
    updateLayout,
    cameraStream,
    isCameraPreviewActive,
    recordingMode,
    sessionState,
    currentReactionElapsed,
    cameraError,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: layout.x,
    initialY: layout.y,
  });

  // Attach camera stream to live video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      if (videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [cameraStream]);

  // Touch and Mouse drag support
  const handlePointerDown = (e: React.PointerEvent) => {
    if (layout.isLocked) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: layout.x,
      initialY: layout.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const deltaX = ((e.clientX - dragStartRef.current.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.startY) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100 - layout.width, Math.round(dragStartRef.current.initialX + deltaX)));
    const newY = Math.max(0, Math.min(100 - layout.height, Math.round(dragStartRef.current.initialY + deltaY)));

    updateLayout({ x: newX, y: newY, preset: 'custom' });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const isRecording = sessionState === 'recording_reaction';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`absolute z-20 cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isDragging ? 'opacity-90 ring-2 ring-sky-400' : ''
      } ${
        layout.shadow === 'strong'
          ? 'shadow-2xl shadow-black'
          : layout.shadow === 'soft'
          ? 'shadow-lg shadow-black/70'
          : ''
      }`}
      style={{
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        width: `${layout.width}%`,
        height: `${layout.height}%`,
        borderRadius:
          layout.shape === 'circle'
            ? '9999px'
            : layout.shape === 'square'
            ? '4px'
            : `${layout.cornerRadius}px`,
        border: layout.hasBorder ? `${layout.borderWidth}px solid ${layout.borderColor}` : 'none',
        overflow: 'hidden',
        backgroundColor: '#0F172A',
      }}
      title="Live Facecam (Drag to position)"
    >
      {/* Real Live Camera Feed */}
      {isCameraPreviewActive && cameraStream && recordingMode === 'camera' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : isCameraPreviewActive && recordingMode === 'voice_only' ? (
        /* Voice-only Live Audio Indicator */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-sky-950 p-2 text-center">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 animate-pulse">
              <Mic className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] font-semibold text-sky-300 mt-1 uppercase tracking-wider">
            Voice Mode
          </span>
        </div>
      ) : (
        /* Camera Off State */
        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/90 text-neutral-400 p-2 text-center pointer-events-none">
          <Camera className="w-5 h-5 mb-1 text-neutral-500" />
          <span className="text-[10px] font-medium text-neutral-400">Camera Off</span>
          <span className="text-[9px] text-neutral-500">Tap &ldquo;Live Cam&rdquo; to turn on</span>
        </div>
      )}

      {/* Live Recording Badge */}
      {isRecording && (
        <div className="absolute top-2 left-2 z-30 bg-red-600/95 backdrop-blur-xs text-white px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="text-[10px] font-bold font-mono tracking-tight">
            REC {formatElapsed(currentReactionElapsed)}
          </span>
        </div>
      )}

      {/* Drag Move Handle Affordance when hovering/tapping */}
      {!layout.isLocked && !isRecording && (
        <div className="absolute bottom-1 right-1 z-30 bg-black/60 rounded p-1 text-white/70 pointer-events-none">
          <Move className="w-3 h-3" />
        </div>
      )}
    </div>
  );
};
