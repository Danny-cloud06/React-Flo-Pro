/**
 * REACTFLOW - Live Reaction Recording Studio
 * Data models and type definitions for Batch 1 & Batch 2
 * Created by Engineer Daniel Nwalor
 */

export type ScreenType = 'home' | 'studio' | 'projects' | 'settings' | 'about';

export type AspectRatioType = '16:9' | '9:16' | '1:1' | 'fit';

export type ProjectStatus = 'draft' | 'in_progress' | 'ready' | 'archived';

export type AudioOutputOption = 'system' | 'wired' | 'bluetooth' | 'speaker';
export type AudioInputOption = 'auto' | 'builtin' | 'bluetooth' | 'wired';

export interface AudioDeviceConfig {
  playbackOutput: AudioOutputOption;
  microphoneInput: AudioInputOption;
  selectedOutputDeviceId?: string;
  selectedInputDeviceId?: string;
}

export type LayoutPreset =
  | 'small_facecam'
  | 'medium_facecam'
  | 'large_facecam'
  | 'pip'
  | 'split_screen'
  | 'fullscreen'
  | 'circular'
  | 'square'
  | 'rounded_rect'
  | 'custom';

export type ReactionDisplayMode =
  | 'freeze_overlay' // Mode 1: source freezes while reaction appears over frozen frame
  | 'split_beside'   // Mode 2: paused source appears beside reaction
  | 'reaction_primary' // Mode 3: reaction becomes primary visual
  | 'custom_composition'; // Mode 4: custom composition

export type FacecamShape = 'circle' | 'square' | 'rounded_rect';

export interface FacecamLayout {
  preset: LayoutPreset;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 15 - 100
  height: number; // percentage 15 - 100
  shape: FacecamShape;
  cornerRadius: number; // px
  borderWidth: number; // px
  borderColor: string;
  hasBorder: boolean;
  shadow: 'none' | 'soft' | 'strong';
  isLocked: boolean;
  displayMode: ReactionDisplayMode;
}

export interface ReactionSegment {
  id: string;
  projectId: string;
  mediaUri: string; // Blob URL or path to recorded webm/mp4
  duration: number; // in seconds
  sourceVideoTimestamp: number; // video position when paused
  recordedAt: number; // timestamp ms
  mode: 'camera' | 'voice_only';
  audioInputId?: string;
  audioOutputId?: string;
  status: 'saved' | 'discarded';
}

export type SessionState =
  | 'idle'
  | 'preparing'
  | 'playing_source'
  | 'recording_reaction'
  | 'finalizing_reaction'
  | 'paused_between_segments'
  | 'completed';

export interface Project {
  id: string;
  name: string;
  sourceVideoUri?: string;
  sourceVideoName?: string;
  sourceVideoDuration: number; // in seconds
  sourceVideoSize?: number; // bytes
  lastPlaybackPosition: number; // in seconds
  aspectRatio: AspectRatioType;
  status: ProjectStatus;
  createdAt: number; // timestamp ms
  updatedAt: number; // timestamp ms
  // Batch 2 extensions
  reactionSegments?: ReactionSegment[];
  layout?: FacecamLayout;
  audioConfig?: AudioDeviceConfig;
  recordingQuality?: '480p' | '720p' | '1080p';
}

export interface AppSettings {
  theme: 'dark' | 'amoled' | 'system';
  defaultAspectRatio: AspectRatioType;
  defaultPreviewFit: 'contain' | 'cover' | 'fill';
  seekInterval: number; // 5, 10, or 15 seconds
  autoPauseOnBackground: boolean;
  hardwareAcceleration: boolean;
  defaultAudioConfig?: AudioDeviceConfig;
  defaultLayout?: FacecamLayout;
  defaultRecordingMode?: 'camera' | 'voice_only';
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bufferedTime: number;
  isLoading: boolean;
  error: string | null;
  videoWidth: number;
  videoHeight: number;
}
