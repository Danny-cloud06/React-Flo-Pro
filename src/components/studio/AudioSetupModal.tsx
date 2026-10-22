/**
 * REACTFLOW - Audio Setup Modal (Milestone M5)
 * Independent selection of Video Playback Output and Voice Recording Microphone,
 * with real microphone level meter and device detection.
 * Created by Engineer Daniel Nwalor
 */

import React, { useEffect } from 'react';
import {
  Headphones,
  Mic,
  Volume2,
  Bluetooth,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { AudioOutputOption, AudioInputOption } from '../../types/project';

export const AudioSetupModal: React.FC = () => {
  const {
    isAudioSetupModalOpen,
    setIsAudioSetupModalOpen,
    audioConfig,
    updateAudioConfig,
    availableAudioDevices,
    refreshAudioDevices,
    micAudioLevel,
    isMicTesting,
    startMicTest,
    stopMicTest,
  } = useApp();

  useEffect(() => {
    if (isAudioSetupModalOpen) {
      refreshAudioDevices();
      startMicTest();
    } else {
      stopMicTest();
    }
  }, [isAudioSetupModalOpen, refreshAudioDevices, startMicTest, stopMicTest]);

  if (!isAudioSetupModalOpen) return null;

  const handleSelectOutput = (output: AudioOutputOption, devId?: string) => {
    updateAudioConfig({
      playbackOutput: output,
      selectedOutputDeviceId: devId || undefined,
    });
  };

  const handleSelectInput = (input: AudioInputOption, devId?: string) => {
    updateAudioConfig({
      microphoneInput: input,
      selectedInputDeviceId: devId || undefined,
    });
    // Restart mic test with new device
    setTimeout(() => {
      startMicTest();
    }, 100);
  };

  return (
    <Modal
      isOpen={isAudioSetupModalOpen}
      onClose={() => setIsAudioSetupModalOpen(false)}
      title="Audio & Microphone Configuration"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 text-neutral-100 max-h-[75vh] overflow-y-auto pr-1">
        {/* Workflow Callout Banner */}
        <div className="rounded-xl bg-sky-950/40 border border-sky-800/60 p-3 flex items-start gap-2.5 text-xs text-sky-200">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Independent Routing Supported:</strong> You can plug in wired earpieces to listen to the video privately, while using the phone&apos;s built-in microphone for commentary.
          </p>
        </div>

        {/* SECTION 1: VIDEO PLAYBACK OUTPUT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-sky-400 flex items-center gap-1.5">
              <Headphones className="w-4 h-4" />
              1. Video Playback Output
            </span>
            <span className="text-[11px] text-neutral-400">Where video sound is heard</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id: 'system',
                label: 'System Auto Routing',
                desc: 'OS default priority',
                icon: RefreshCw,
              },
              {
                id: 'wired',
                label: 'Wired Headphones',
                desc: '3.5mm jack / Type-C earpiece',
                icon: Headphones,
              },
              {
                id: 'bluetooth',
                label: 'Bluetooth Earbuds',
                desc: 'Wireless headset',
                icon: Bluetooth,
              },
              {
                id: 'speaker',
                label: 'Phone Loudspeaker',
                desc: 'Built-in phone speakers',
                icon: Volume2,
              },
            ].map((opt) => {
              const isSelected = audioConfig.playbackOutput === opt.id;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOutput(opt.id as AudioOutputOption)}
                  className={`min-h-[58px] p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/15 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-neutral-400'}`} />
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-neutral-400">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: VOICE RECORDING MICROPHONE */}
        <div className="space-y-3 pt-2 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-sky-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4" />
              2. Voice Commentary Microphone
            </span>
            <span className="text-[11px] text-neutral-400">Microphone for commentary</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id: 'builtin',
                label: 'Built-in Phone Mic',
                desc: 'Recommended with earpieces',
                icon: Mic,
              },
              {
                id: 'wired',
                label: 'Wired Headset Mic',
                desc: 'In-line cable mic',
                icon: Headphones,
              },
              {
                id: 'bluetooth',
                label: 'Bluetooth Mic',
                desc: 'Wireless headset mic',
                icon: Bluetooth,
              },
              {
                id: 'auto',
                label: 'Automatic Selection',
                desc: 'System managed',
                icon: RefreshCw,
              },
            ].map((opt) => {
              const isSelected = audioConfig.microphoneInput === opt.id;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectInput(opt.id as AudioInputOption)}
                  className={`min-h-[58px] p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/15 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-neutral-400'}`} />
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-neutral-400">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* REAL MICROPHONE LIVE TEST WITH VU METER */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-sky-400" />
              Live Microphone Input Test
            </span>
            <span className="font-mono text-[11px] text-sky-400">
              {micAudioLevel > 0 ? `${micAudioLevel}%` : 'Silent'}
            </span>
          </div>

          {/* VU Level Bar */}
          <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                micAudioLevel > 75
                  ? 'bg-amber-400'
                  : micAudioLevel > 30
                  ? 'bg-sky-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(2, micAudioLevel)}%` }}
            />
          </div>

          <p className="text-[11px] text-neutral-400">
            Speak into your microphone now. The live meter reflects genuine captured audio levels.
          </p>
        </div>

        {/* Detected Devices Inventory */}
        <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
          <span>
            Detected {availableAudioDevices.inputs.length} mic(s), {availableAudioDevices.outputs.length} output(s)
          </span>
          <button
            onClick={refreshAudioDevices}
            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px]"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Scan Devices</span>
          </button>
        </div>

        {/* Done CTA */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsAudioSetupModalOpen(false)}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Apply Audio Configuration
          </button>
        </div>
      </div>
    </Modal>
  );
};
