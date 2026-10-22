/**
 * REACTFLOW - Customizable Reaction Layout Editor (Milestone M8)
 * Real-time positioning, resizing, shaping, and preset controls.
 * Created by Engineer Daniel Nwalor
 */

import React from 'react';
import {
  Layers,
  Square,
  Circle,
  Maximize2,
  Lock,
  Unlock,
  RotateCcw,
  Check,
  Move,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { LayoutPreset, ReactionDisplayMode, FacecamShape } from '../../types/project';
import { PRESET_LABELS } from '../../services/layoutPresets';

export const LayoutEditorModal: React.FC = () => {
  const {
    isLayoutEditorOpen,
    setIsLayoutEditorOpen,
    layout,
    updateLayout,
    applyLayoutPreset,
    resetLayout,
    videoSrc,
    cameraStream,
  } = useApp();

  if (!isLayoutEditorOpen) return null;

  const setAlign = (corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') => {
    switch (corner) {
      case 'top-left':
        updateLayout({ x: 5, y: 5 });
        break;
      case 'top-right':
        updateLayout({ x: 100 - layout.width - 5, y: 5 });
        break;
      case 'bottom-left':
        updateLayout({ x: 5, y: 100 - layout.height - 5 });
        break;
      case 'bottom-right':
        updateLayout({ x: 100 - layout.width - 5, y: 100 - layout.height - 5 });
        break;
      case 'center':
        updateLayout({
          x: Math.max(0, Math.round((100 - layout.width) / 2)),
          y: Math.max(0, Math.round((100 - layout.height) / 2)),
        });
        break;
    }
  };

  return (
    <Modal
      isOpen={isLayoutEditorOpen}
      onClose={() => setIsLayoutEditorOpen(false)}
      title="Reaction Camera Layout Editor"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-neutral-100 max-h-[78vh] overflow-y-auto pr-1">
        {/* INTERACTIVE MINI CANVAS PREVIEW */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300">Live Composition Preview</span>
            <span className="font-mono text-[11px] text-sky-400">
              {layout.width}% × {layout.height}% @ ({layout.x}%, {layout.y}%)
            </span>
          </div>

          <div className="relative w-full aspect-video bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden select-none flex items-center justify-center">
            {/* Background source video simulator */}
            {videoSrc ? (
              <video
                src={videoSrc}
                className="w-full h-full object-cover opacity-60 pointer-events-none"
                muted
              />
            ) : (
              <div className="text-center text-xs text-neutral-500">
                Source Video Layer (16:9)
              </div>
            )}

            {/* Facecam Layer Box */}
            <div
              className={`absolute transition-all duration-75 overflow-hidden flex items-center justify-center ${
                layout.shadow === 'strong'
                  ? 'shadow-2xl shadow-black'
                  : layout.shadow === 'soft'
                  ? 'shadow-lg shadow-black/60'
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
                border: layout.hasBorder
                  ? `${layout.borderWidth}px solid ${layout.borderColor}`
                  : 'none',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
              }}
            >
              {cameraStream ? (
                <video
                  ref={(el) => {
                    if (el && cameraStream && el.srcObject !== cameraStream) {
                      el.srcObject = cameraStream;
                      el.play().catch(() => {});
                    }
                  }}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-1 text-center">
                  <div className="w-2 h-2 rounded-full bg-sky-400 mb-1" />
                  <span className="text-[10px] font-bold text-sky-300 uppercase">Facecam</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 10 STARTING PRESETS HORIZONTAL SELECTOR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-sky-400">
              Starting Presets
            </span>
            <button
              onClick={resetLayout}
              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_LABELS.map((p) => {
              const isSelected = layout.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => applyLayoutPreset(p.id)}
                  className={`min-h-[48px] p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/15 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{p.label}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CUSTOM CANVAS CONTROLS */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Canvas Adjustments</span>
          </div>

          {/* Quick Corner Alignment */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-300 block">Quick Corner Alignment</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'top-left', label: 'Top-Left' },
                  { id: 'top-right', label: 'Top-Right' },
                  { id: 'center', label: 'Center' },
                  { id: 'bottom-left', label: 'Bottom-Left' },
                  { id: 'bottom-right', label: 'Bottom-Right' },
                ] as const
              ).map((align) => (
                <button
                  key={align.id}
                  onClick={() => setAlign(align.id)}
                  className="min-h-[38px] px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-200 transition-colors"
                >
                  {align.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position & Size Sliders */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">X Position</span>
                <span className="font-mono text-white">{layout.x}%</span>
              </div>
              <input
                type="range"
                min="0"
                max={100 - layout.width}
                value={layout.x}
                onChange={(e) => updateLayout({ x: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Y Position</span>
                <span className="font-mono text-white">{layout.y}%</span>
              </div>
              <input
                type="range"
                min="0"
                max={100 - layout.height}
                value={layout.y}
                onChange={(e) => updateLayout({ y: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Width</span>
                <span className="font-mono text-white">{layout.width}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                value={layout.width}
                onChange={(e) => updateLayout({ width: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Height</span>
                <span className="font-mono text-white">{layout.height}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                value={layout.height}
                onChange={(e) => updateLayout({ height: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Mask & Shape */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-800">
            <label className="text-[11px] text-neutral-300 block">Facecam Shape & Mask</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rounded_rect', label: 'Rounded Rect' },
                { id: 'circle', label: 'Circular' },
                { id: 'square', label: 'Square 1:1' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => updateLayout({ shape: s.id as FacecamShape })}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    layout.shape === s.id
                      ? 'border-sky-500 bg-sky-500/15 text-white'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Border & Shadow */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800 text-xs">
            <div>
              <label className="text-[11px] text-neutral-300 block mb-1">Border Color</label>
              <div className="flex items-center gap-2">
                {['#38BDF8', '#FFFFFF', '#10B981', '#A855F7'].map((col) => (
                  <button
                    key={col}
                    onClick={() => updateLayout({ borderColor: col, hasBorder: true })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      layout.borderColor === col && layout.hasBorder ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                    aria-label={`Select border color ${col}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-300 block mb-1">Elevation Shadow</label>
              <div className="flex gap-1">
                {(['none', 'soft', 'strong'] as const).map((sh) => (
                  <button
                    key={sh}
                    onClick={() => updateLayout({ shadow: sh })}
                    className={`flex-1 min-h-[36px] rounded-lg border text-[11px] capitalize transition-all ${
                      layout.shadow === sh
                        ? 'border-sky-500 bg-sky-500/15 text-white'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Display Mode Selection */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-800">
            <label className="text-[11px] text-neutral-300 block">Reaction Display Mode</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                {
                  id: 'freeze_overlay',
                  title: 'Mode 1: Freeze Overlay',
                  desc: 'Facecam over frozen source frame',
                },
                {
                  id: 'split_beside',
                  title: 'Mode 2: Split Beside',
                  desc: 'Source video beside reaction',
                },
                {
                  id: 'reaction_primary',
                  title: 'Mode 3: Reaction Primary',
                  desc: 'Reaction becomes main visual',
                },
                {
                  id: 'custom_composition',
                  title: 'Mode 4: Custom Canvas',
                  desc: 'Personalized arrangement',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateLayout({ displayMode: m.id as ReactionDisplayMode })}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    layout.displayMode === m.id
                      ? 'border-sky-500 bg-sky-500/15 text-white'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300'
                  }`}
                >
                  <div className="font-semibold text-[11px]">{m.title}</div>
                  <div className="text-[10px] text-neutral-400">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save & Apply CTA */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsLayoutEditorOpen(false)}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Apply & Save Layout
          </button>
        </div>
      </div>
    </Modal>
  );
};
