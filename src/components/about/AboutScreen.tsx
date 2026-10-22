/**
 * REACTFLOW - About Screen
 * Creator Profile & Philosophy of Engineer Daniel Nwalor
 */

import React from 'react';
import { ArrowLeft, Quote, Sparkles, Cpu, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AboutScreen: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 text-neutral-100 max-w-xl mx-auto w-full">
      {/* Navigation Back */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigateTo('settings')}
          className="min-h-[44px] px-3 py-2 -ml-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          aria-label="Back to Settings"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>
      </div>

      {/* Header & Brand */}
      <div className="space-y-2 text-center pt-1">
        <img
          src="/app-icon.jpg"
          alt="REACTFLOW Official Icon"
          className="w-16 h-16 rounded-2xl mx-auto shadow-xl shadow-sky-500/20 border border-sky-500/30 object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">REACTFLOW</h1>
          <p className="text-xs font-semibold tracking-wider text-sky-400 uppercase mt-0.5">
            LIVE REACTION RECORDING STUDIO
          </p>
        </div>
      </div>

      {/* Creator Profile Card: Engineer Daniel Nwalor */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-5 shadow-xl">
        {/* Creator Header with Real Photo */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-neutral-800 text-center sm:text-left">
          <div className="relative shrink-0">
            <img
              src="/creator_profile.jpg"
              alt="Engineer Daniel Nwalor"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-xl border-2 border-sky-500/50 ring-4 ring-sky-500/10"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-500 border-2 border-neutral-900 flex items-center justify-center text-white shadow-md">
              <Cpu className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-[11px] font-semibold tracking-wider text-sky-400 uppercase block">
              Created by
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Engineer Daniel Nwalor
            </h2>
            <p className="text-xs text-neutral-400">
              Creator & Lead Engineer of REACTFLOW
            </p>
          </div>
        </div>

        {/* Official Creator Biography */}
        <div className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          <p>
            Daniel Nwalor is a young computer engineer driven by curiosity, creativity, and the desire to turn ambitious ideas into working technology. REACTFLOW reflects his interest in building practical tools that make content creation more accessible.
          </p>

          {/* Philosophy Card */}
          <div className="rounded-xl bg-neutral-950/80 border border-neutral-800 p-4 space-y-2 my-2">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-sky-400" />
              <span>Philosophy</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-sky-300 tracking-wide">
              &ldquo;THINK BEYOND THE ORDINARY. ENGINEER WHAT COMES NEXT.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* System Specifications */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Application Specifications
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-neutral-800/60">
            <span className="text-neutral-400">Application Name</span>
            <span className="font-semibold text-white">REACTFLOW</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-800/60">
            <span className="text-neutral-400">Version</span>
            <span className="font-mono text-white">1.0.0</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-800/60">
            <span className="text-neutral-400">Target Device Profile</span>
            <span className="text-neutral-200">TECNO Camon 20 Pro · Android 14 (API 34)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-800/60">
            <span className="text-neutral-400">Media & Recording Engine</span>
            <span className="text-neutral-200">AndroidX Media3 ExoPlayer & CameraX</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">User Interface</span>
            <span className="text-neutral-200">Jetpack Compose with Material 3</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center pt-1 pb-6 space-y-1 text-xs text-neutral-500">
        <p>© 2026 REACTFLOW. All rights reserved.</p>
        <p>Engineered by Daniel Nwalor.</p>
      </div>
    </div>
  );
};
