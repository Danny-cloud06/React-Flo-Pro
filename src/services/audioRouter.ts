/**
 * REACTFLOW - Audio Routing & Device Management Service
 * Provides genuine audio input/output routing, device detection, and real microphone level monitoring.
 * Created by Engineer Daniel Nwalor
 */

import { AudioOutputOption, AudioInputOption, AudioDeviceConfig } from '../types/project';

export interface DetectedDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
  groupId?: string;
  isWired?: boolean;
  isBluetooth?: boolean;
  isBuiltIn?: boolean;
}

export class AudioRouterService {
  private static instance: AudioRouterService;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private levelCallback: ((level: number) => void) | null = null;
  private animationFrameId: number | null = null;
  private deviceChangeCallbacks: Set<() => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        this.notifyDeviceChange();
      });
    }
  }

  public static getInstance(): AudioRouterService {
    if (!AudioRouterService.instance) {
      AudioRouterService.instance = new AudioRouterService();
    }
    return AudioRouterService.instance;
  }

  public onDeviceChange(callback: () => void): () => void {
    this.deviceChangeCallbacks.add(callback);
    return () => this.deviceChangeCallbacks.delete(callback);
  }

  private notifyDeviceChange() {
    this.deviceChangeCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in device change listener:', err);
      }
    });
  }

  /**
   * Enumerate actual physical and system audio devices
   */
  public async getAvailableAudioDevices(): Promise<{
    inputs: DetectedDevice[];
    outputs: DetectedDevice[];
  }> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return { inputs: [], outputs: [] };
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs: DetectedDevice[] = [];
      const outputs: DetectedDevice[] = [];

      for (const dev of devices) {
        const lowerLabel = dev.label.toLowerCase();
        const isBluetooth =
          lowerLabel.includes('bluetooth') ||
          lowerLabel.includes('airpods') ||
          lowerLabel.includes('buds') ||
          lowerLabel.includes('headset') ||
          lowerLabel.includes('wireless') ||
          lowerLabel.includes('bt');
        const isWired =
          lowerLabel.includes('wired') ||
          lowerLabel.includes('headphone') ||
          lowerLabel.includes('earphone') ||
          lowerLabel.includes('3.5mm') ||
          lowerLabel.includes('jack') ||
          lowerLabel.includes('earpiece');
        const isBuiltIn =
          lowerLabel.includes('built-in') ||
          lowerLabel.includes('internal') ||
          lowerLabel.includes('speaker') ||
          lowerLabel.includes('default') ||
          (!isBluetooth && !isWired);

        const detected: DetectedDevice = {
          deviceId: dev.deviceId,
          label: dev.label || (dev.kind === 'audioinput' ? 'Microphone' : 'Audio Output'),
          kind: dev.kind as 'audioinput' | 'audiooutput',
          groupId: dev.groupId,
          isWired,
          isBluetooth,
          isBuiltIn,
        };

        if (dev.kind === 'audioinput') {
          inputs.push(detected);
        } else if (dev.kind === 'audiooutput') {
          outputs.push(detected);
        }
      }

      return { inputs, outputs };
    } catch (err) {
      console.warn('Failed to enumerate audio devices:', err);
      return { inputs: [], outputs: [] };
    }
  }

  /**
   * Apply video playback output routing to an HTMLVideoElement
   */
  public async applyPlaybackOutput(
    videoElement: HTMLVideoElement | null,
    config: AudioDeviceConfig
  ): Promise<{ success: boolean; message: string }> {
    if (!videoElement) {
      return { success: false, message: 'Video element not ready' };
    }

    // Check setSinkId support (supported on Android Chrome & modern Chromium)
    const mediaWithSink = videoElement as any;
    if (typeof mediaWithSink.setSinkId !== 'function') {
      return {
        success: true,
        message: 'System auto-routing active (setSinkId not exposed by this browser). Android will route through default connected device.',
      };
    }

    try {
      const { outputs } = await this.getAvailableAudioDevices();
      let targetDeviceId = '';

      if (config.playbackOutput === 'system') {
        targetDeviceId = ''; // default
      } else if (config.selectedOutputDeviceId) {
        targetDeviceId = config.selectedOutputDeviceId;
      } else if (config.playbackOutput === 'wired') {
        const wired = outputs.find((o) => o.isWired);
        if (wired) targetDeviceId = wired.deviceId;
      } else if (config.playbackOutput === 'bluetooth') {
        const bt = outputs.find((o) => o.isBluetooth);
        if (bt) targetDeviceId = bt.deviceId;
      } else if (config.playbackOutput === 'speaker') {
        const spk = outputs.find((o) => o.isBuiltIn && !o.isWired && !o.isBluetooth);
        if (spk) targetDeviceId = spk.deviceId;
      }

      await mediaWithSink.setSinkId(targetDeviceId);
      return {
        success: true,
        message: `Playback routed to: ${config.playbackOutput.toUpperCase()}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Could not switch audio output: ${err.message || 'Access denied'}`,
      };
    }
  }

  /**
   * Start microphone audio level testing
   */
  public async startMicMeter(
    preferredInput: AudioInputOption,
    selectedDeviceId?: string,
    onLevel?: (level: number) => void
  ): Promise<{ stream: MediaStream | null; error: string | null }> {
    this.stopMicMeter();

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return { stream: null, error: 'Audio capture API unavailable' };
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
        video: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.micStream = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      this.levelCallback = onLevel || null;
      this.runMeterLoop();

      return { stream, error: null };
    } catch (err: any) {
      return {
        stream: null,
        error:
          err.name === 'NotAllowedError'
            ? 'Microphone permission denied. Please grant microphone access in settings.'
            : `Microphone initialization error: ${err.message || 'Device in use'}`,
      };
    }
  }

  private runMeterLoop() {
    if (!this.analyser || !this.levelCallback) return;

    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    const loop = () => {
      if (!this.analyser || !this.levelCallback) return;
      this.analyser.getByteFrequencyData(buffer);

      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i];
      }
      const avg = sum / buffer.length;
      // Scale from 0-255 to 0-100%
      const percentage = Math.min(100, Math.round((avg / 128) * 100));

      this.levelCallback(percentage);
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopMicMeter() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    this.analyser = null;
    this.levelCallback = null;
  }
}
