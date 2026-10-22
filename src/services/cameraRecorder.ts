/**
 * REACTFLOW - Camera & Voice Recording Service
 * Manages front-camera live feed, microphone audio capture, and MediaRecorder segment compilation.
 * Created by Engineer Daniel Nwalor
 */

import { ReactionSegment } from '../types/project';
import { storeSegmentBlob } from './storage';

export interface CameraConfig {
  mode: 'camera' | 'voice_only';
  quality: '480p' | '720p' | '1080p';
  audioDeviceId?: string;
  videoDeviceId?: string;
}

export class CameraRecorderService {
  private static instance: CameraRecorderService;
  private activeStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime = 0;
  private recordingTimerInterval: number | null = null;

  private constructor() {}

  public static getInstance(): CameraRecorderService {
    if (!CameraRecorderService.instance) {
      CameraRecorderService.instance = new CameraRecorderService();
    }
    return CameraRecorderService.instance;
  }

  /**
   * Request live stream for preview or recording
   */
  public async getLiveStream(
    config: CameraConfig
  ): Promise<{ stream: MediaStream | null; error: string | null }> {
    this.stopStream();

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return { stream: null, error: 'Camera and audio recording APIs unavailable in this environment' };
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: config.audioDeviceId
          ? { deviceId: { exact: config.audioDeviceId } }
          : {
              echoCancellation: true,
              noiseSuppression: true,
            },
        video:
          config.mode === 'voice_only'
            ? false
            : {
                facingMode: 'user',
                width: config.quality === '1080p' ? 1920 : config.quality === '720p' ? 1280 : 854,
                height: config.quality === '1080p' ? 1080 : config.quality === '720p' ? 720 : 480,
                frameRate: { ideal: 30, max: 30 },
              },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      return { stream, error: null };
    } catch (err: any) {
      return {
        stream: null,
        error:
          err.name === 'NotAllowedError'
            ? 'Camera or microphone access denied. Please grant permissions to record reactions.'
            : `Failed to initialize camera: ${err.message || 'Device busy'}`,
      };
    }
  }

  /**
   * Start live reaction recording
   */
  public async startRecording(
    stream: MediaStream,
    onTick?: (seconds: number) => void
  ): Promise<{ success: boolean; error: string | null }> {
    this.recordedChunks = [];

    try {
      // Find supported mime type
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
        'audio/webm',
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
      this.mediaRecorder = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      recorder.start(250); // Slice chunks every 250ms
      this.recordingStartTime = Date.now();

      if (onTick) {
        if (this.recordingTimerInterval) clearInterval(this.recordingTimerInterval);
        this.recordingTimerInterval = window.setInterval(() => {
          const elapsed = (Date.now() - this.recordingStartTime) / 1000;
          onTick(elapsed);
        }, 100);
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: 'Could not start MediaRecorder: ' + err.message };
    }
  }

  /**
   * Stop recording and compile reaction segment
   */
  public async stopRecording(
    projectId: string,
    sourceVideoTimestamp: number,
    mode: 'camera' | 'voice_only'
  ): Promise<ReactionSegment | null> {
    if (this.recordingTimerInterval) {
      clearInterval(this.recordingTimerInterval);
      this.recordingTimerInterval = null;
    }

    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return null;
    }

    const duration = Math.max(0.5, (Date.now() - this.recordingStartTime) / 1000);

    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(null);

      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder?.mimeType || (mode === 'voice_only' ? 'audio/webm' : 'video/webm');
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const segmentId = 'seg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

        await storeSegmentBlob(segmentId, blob);
        const mediaUri = URL.createObjectURL(blob);

        const segment: ReactionSegment = {
          id: segmentId,
          projectId,
          mediaUri,
          duration,
          sourceVideoTimestamp,
          recordedAt: Date.now(),
          mode,
          status: 'saved',
        };

        resolve(segment);
      };

      this.mediaRecorder.stop();
    });
  }

  public stopStream() {
    if (this.recordingTimerInterval) {
      clearInterval(this.recordingTimerInterval);
      this.recordingTimerInterval = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder = null;
    }
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => track.stop());
      this.activeStream = null;
    }
  }
}
