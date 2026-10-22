/**
 * REACTFLOW - Application State Context (Batch 1 & Batch 2)
 * Comprehensive state for Video Playback, Audio Routing, Camera Recording,
 * Pause-and-React Session Engine, and Customizable Layouts.
 * Created by Engineer Daniel Nwalor
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  Project,
  AppSettings,
  ScreenType,
  AspectRatioType,
  AudioDeviceConfig,
  FacecamLayout,
  LayoutPreset,
  ReactionSegment,
  SessionState,
} from '../types/project';
import {
  getSavedProjects,
  saveProject,
  deleteProjectById,
  getActiveProjectId,
  setActiveProjectId,
  getAppSettings,
  saveAppSettings,
  getVideoBlob,
  storeVideoBlob,
  clearAllProjectStorage,
  DEFAULT_SETTINGS,
  DEFAULT_LAYOUT,
  DEFAULT_AUDIO_CONFIG,
  removeSegmentBlob,
} from '../services/storage';
import { AudioRouterService, DetectedDevice } from '../services/audioRouter';
import { CameraRecorderService } from '../services/cameraRecorder';
import { LAYOUT_PRESETS } from '../services/layoutPresets';

interface AppContextType {
  // Navigation
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType) => void;

  // Projects
  projects: Project[];
  activeProject: Project | null;
  createNewProject: (name: string, videoFile?: File, sampleType?: 'tech' | 'nature') => Promise<Project>;
  openProject: (projectId: string) => Promise<boolean>;
  renameProject: (projectId: string, newName: string) => void;
  deleteProject: (projectId: string) => Promise<void>;
  updateActiveProjectPosition: (positionSeconds: number) => void;
  updateActiveProjectAspectRatio: (ratio: AspectRatioType) => void;
  relinkVideoToProject: (projectId: string, videoFile: File) => Promise<boolean>;

  // Video Source for Studio
  videoSrc: string | null;
  videoFileName: string | null;
  isVideoLoading: boolean;
  videoError: string | null;
  setVideoError: (err: string | null) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  clearAllData: () => Promise<void>;

  // Device emulation & Orientation
  deviceOrientation: 'portrait' | 'landscape';
  toggleDeviceOrientation: () => void;
  showDeviceShell: boolean;
  setShowDeviceShell: (show: boolean) => void;

  // --- BATCH 2: M5 AUDIO ROUTING ---
  audioConfig: AudioDeviceConfig;
  updateAudioConfig: (config: Partial<AudioDeviceConfig>) => Promise<void>;
  availableAudioDevices: { inputs: DetectedDevice[]; outputs: DetectedDevice[] };
  refreshAudioDevices: () => Promise<void>;
  micAudioLevel: number;
  isMicTesting: boolean;
  startMicTest: () => Promise<void>;
  stopMicTest: () => void;
  isAudioSetupModalOpen: boolean;
  setIsAudioSetupModalOpen: (open: boolean) => void;

  // --- BATCH 2: M6 & M7 CAMERA & PAUSE-AND-REACT ENGINE ---
  sessionState: SessionState;
  recordingMode: 'camera' | 'voice_only';
  setRecordingMode: (mode: 'camera' | 'voice_only') => void;
  recordingQuality: '480p' | '720p' | '1080p';
  setRecordingQuality: (quality: '480p' | '720p' | '1080p') => void;
  cameraStream: MediaStream | null;
  cameraError: string | null;
  isCameraPreviewActive: boolean;
  toggleCameraPreview: () => Promise<void>;
  currentReactionElapsed: number;
  startLiveSession: () => Promise<boolean>;
  pauseAndReact: () => Promise<void>;
  stopReaction: () => Promise<ReactionSegment | null>;
  resumeVideo: () => void;
  finishSession: () => void;
  discardReactionSegment: (segmentId: string) => Promise<void>;
  reviewingSegment: ReactionSegment | null;
  setReviewingSegment: (segment: ReactionSegment | null) => void;
  sessionSummaryData: {
    project: Project;
    segments: ReactionSegment[];
    totalDuration: number;
  } | null;
  closeSessionSummary: () => void;

  // --- BATCH 2: M8 CUSTOMIZABLE LAYOUT ENGINE ---
  layout: FacecamLayout;
  updateLayout: (partial: Partial<FacecamLayout>) => void;
  applyLayoutPreset: (preset: LayoutPreset) => void;
  resetLayout: () => void;
  isLayoutEditorOpen: boolean;
  setIsLayoutEditorOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(getAppSettings());

  // Studio Video state
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Device view preferences
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showDeviceShell, setShowDeviceShell] = useState<boolean>(true);

  // --- Batch 2: Audio Routing States ---
  const [audioConfig, setAudioConfig] = useState<AudioDeviceConfig>(
    settings.defaultAudioConfig || DEFAULT_AUDIO_CONFIG
  );
  const [availableAudioDevices, setAvailableAudioDevices] = useState<{
    inputs: DetectedDevice[];
    outputs: DetectedDevice[];
  }>({ inputs: [], outputs: [] });
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);
  const [isMicTesting, setIsMicTesting] = useState<boolean>(false);
  const [isAudioSetupModalOpen, setIsAudioSetupModalOpen] = useState<boolean>(false);

  // --- Batch 2: Camera & Session States ---
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [recordingMode, setRecordingMode] = useState<'camera' | 'voice_only'>(
    settings.defaultRecordingMode || 'camera'
  );
  const [recordingQuality, setRecordingQuality] = useState<'480p' | '720p' | '1080p'>('720p');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraPreviewActive, setIsCameraPreviewActive] = useState<boolean>(false);
  const [currentReactionElapsed, setCurrentReactionElapsed] = useState<number>(0);
  const [reviewingSegment, setReviewingSegment] = useState<ReactionSegment | null>(null);
  const [sessionSummaryData, setSessionSummaryData] = useState<{
    project: Project;
    segments: ReactionSegment[];
    totalDuration: number;
  } | null>(null);

  // --- Batch 2: Layout Engine States ---
  const [layout, setLayout] = useState<FacecamLayout>(DEFAULT_LAYOUT);
  const [isLayoutEditorOpen, setIsLayoutEditorOpen] = useState<boolean>(false);

  const currentBlobUrlRef = useRef<string | null>(null);
  const audioRouter = AudioRouterService.getInstance();
  const cameraRecorder = CameraRecorderService.getInstance();

  const cleanupBlobUrl = useCallback(() => {
    if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
  }, []);

  // Refresh physical audio devices
  const refreshAudioDevices = useCallback(async () => {
    const devices = await audioRouter.getAvailableAudioDevices();
    setAvailableAudioDevices(devices);
  }, [audioRouter]);

  // Load initial projects & restore active project if exists
  useEffect(() => {
    const list = getSavedProjects();
    setProjects(list);

    const activeId = getActiveProjectId();
    if (activeId) {
      const found = list.find((p) => p.id === activeId);
      if (found) {
        setActiveProjectState(found);
        if (found.layout) setLayout(found.layout);
        if (found.audioConfig) setAudioConfig(found.audioConfig);
      }
    }

    refreshAudioDevices();
    const unsub = audioRouter.onDeviceChange(() => {
      refreshAudioDevices();
    });
    return () => unsub();
  }, [audioRouter, refreshAudioDevices]);

  // When activeProject changes, update layout and audio config from project
  useEffect(() => {
    if (activeProject) {
      if (activeProject.layout) setLayout(activeProject.layout);
      if (activeProject.audioConfig) setAudioConfig(activeProject.audioConfig);
    }
  }, [activeProject?.id]);

  // Load active project video source
  useEffect(() => {
    let isCancelled = false;

    async function loadActiveVideo() {
      if (!activeProject) {
        cleanupBlobUrl();
        setVideoSrc(null);
        setVideoFileName(null);
        setVideoError(null);
        return;
      }

      setIsVideoLoading(true);
      setVideoError(null);
      setVideoFileName(activeProject.sourceVideoName || 'Source Video');

      try {
        const blob = await getVideoBlob(activeProject.id);
        if (isCancelled) return;

        if (blob) {
          cleanupBlobUrl();
          const objectUrl = URL.createObjectURL(blob);
          currentBlobUrlRef.current = objectUrl;
          setVideoSrc(objectUrl);
          setIsVideoLoading(false);
          return;
        }

        if (activeProject.sourceVideoUri && !activeProject.sourceVideoUri.startsWith('blob:')) {
          cleanupBlobUrl();
          setVideoSrc(activeProject.sourceVideoUri);
          setIsVideoLoading(false);
          return;
        }

        setVideoSrc(null);
        setIsVideoLoading(false);
        setVideoError('Source video is no longer accessible. Please re-link or re-import the video.');
      } catch (err: any) {
        if (!isCancelled) {
          setIsVideoLoading(false);
          setVideoError('Error loading source video: ' + (err.message || 'Unknown error'));
        }
      }
    }

    loadActiveVideo();

    return () => {
      isCancelled = true;
    };
  }, [activeProject?.id, cleanupBlobUrl]);

  // Audio output routing application
  const updateAudioConfig = useCallback(
    async (partial: Partial<AudioDeviceConfig>) => {
      const merged = { ...audioConfig, ...partial };
      setAudioConfig(merged);

      if (videoRef.current) {
        await audioRouter.applyPlaybackOutput(videoRef.current, merged);
      }

      if (activeProject) {
        const updated = { ...activeProject, audioConfig: merged, updatedAt: Date.now() };
        saveProject(updated);
        setActiveProjectState(updated);
      }
    },
    [audioConfig, audioRouter, activeProject]
  );

  // Mic test level loop
  const startMicTest = useCallback(async () => {
    setIsMicTesting(true);
    const res = await audioRouter.startMicMeter(
      audioConfig.microphoneInput,
      audioConfig.selectedInputDeviceId,
      (level) => setMicAudioLevel(level)
    );
    if (res.error) {
      setCameraError(res.error);
    }
  }, [audioConfig, audioRouter]);

  const stopMicTest = useCallback(() => {
    audioRouter.stopMicMeter();
    setIsMicTesting(false);
    setMicAudioLevel(0);
  }, [audioRouter]);

  // Camera preview toggle
  const toggleCameraPreview = useCallback(async () => {
    if (isCameraPreviewActive) {
      cameraRecorder.stopStream();
      setCameraStream(null);
      setIsCameraPreviewActive(false);
      setCameraError(null);
    } else {
      setCameraError(null);
      const res = await cameraRecorder.getLiveStream({
        mode: recordingMode,
        quality: recordingQuality,
        audioDeviceId: audioConfig.selectedInputDeviceId,
      });
      if (res.stream) {
        setCameraStream(res.stream);
        setIsCameraPreviewActive(true);
      } else {
        setCameraError(res.error || 'Could not open camera stream');
      }
    }
  }, [isCameraPreviewActive, recordingMode, recordingQuality, audioConfig.selectedInputDeviceId, cameraRecorder]);

  // Stop camera when leaving Studio
  useEffect(() => {
    if (currentScreen !== 'studio') {
      if (isCameraPreviewActive) {
        cameraRecorder.stopStream();
        setCameraStream(null);
        setIsCameraPreviewActive(false);
      }
      stopMicTest();
    }
  }, [currentScreen, isCameraPreviewActive, cameraRecorder, stopMicTest]);

  // Navigation
  const navigateTo = useCallback((screen: ScreenType) => {
    setCurrentScreen(screen);
  }, []);

  const openProject = useCallback(async (projectId: string): Promise<boolean> => {
    const list = getSavedProjects();
    const found = list.find((p) => p.id === projectId);
    if (!found) return false;

    setActiveProjectId(projectId);
    setActiveProjectState(found);
    if (found.layout) setLayout(found.layout);
    if (found.audioConfig) setAudioConfig(found.audioConfig);
    setSessionState('idle');
    setCurrentScreen('studio');
    return true;
  }, []);

  const createNewProject = useCallback(
    async (name: string, videoFile?: File, sampleType?: 'tech' | 'nature'): Promise<Project> => {
      const projectId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      let videoName = 'reaction_source.mp4';
      let videoDuration = 0;
      let videoSize = 0;
      let uri = '';

      if (videoFile) {
        videoName = videoFile.name;
        videoSize = videoFile.size;
        await storeVideoBlob(projectId, videoFile, videoFile.name);
      } else if (sampleType === 'nature') {
        uri = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
        videoName = 'Sample - Big Blaze Nature Clip.mp4';
        videoDuration = 15;
      } else {
        uri = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        videoName = 'Sample - Studio Demo Video.mp4';
        videoDuration = 596;
      }

      const newProj: Project = {
        id: projectId,
        name: name.trim() || `Reaction Project #${projects.length + 1}`,
        sourceVideoUri: uri || undefined,
        sourceVideoName: videoName,
        sourceVideoDuration: videoDuration,
        sourceVideoSize: videoSize,
        lastPlaybackPosition: 0,
        aspectRatio: settings.defaultAspectRatio || '16:9',
        status: 'in_progress',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        reactionSegments: [],
        layout: DEFAULT_LAYOUT,
        audioConfig: audioConfig,
        recordingQuality: '720p',
      };

      saveProject(newProj);
      setActiveProjectId(projectId);
      setActiveProjectState(newProj);
      setLayout(DEFAULT_LAYOUT);
      setSessionState('idle');
      setProjects(getSavedProjects());
      setCurrentScreen('studio');

      return newProj;
    },
    [projects.length, settings.defaultAspectRatio, audioConfig]
  );

  const renameProject = useCallback((projectId: string, newName: string) => {
    const list = getSavedProjects();
    const found = list.find((p) => p.id === projectId);
    if (found) {
      found.name = newName.trim();
      saveProject(found);
      const updatedList = getSavedProjects();
      setProjects(updatedList);
      if (activeProject?.id === projectId) {
        setActiveProjectState({ ...found });
      }
    }
  }, [activeProject?.id]);

  const deleteProject = useCallback(async (projectId: string) => {
    await deleteProjectById(projectId);
    const updatedList = getSavedProjects();
    setProjects(updatedList);
    if (activeProject?.id === projectId) {
      setActiveProjectState(null);
      setVideoSrc(null);
      setVideoFileName(null);
      setSessionState('idle');
    }
  }, [activeProject?.id]);

  const updateActiveProjectPosition = useCallback((positionSeconds: number) => {
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      lastPlaybackPosition: Math.max(0, positionSeconds),
      updatedAt: Date.now(),
    };
    saveProject(updated);
    setActiveProjectState(updated);
  }, [activeProject]);

  const updateActiveProjectAspectRatio = useCallback((ratio: AspectRatioType) => {
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      aspectRatio: ratio,
      updatedAt: Date.now(),
    };
    saveProject(updated);
    setActiveProjectState(updated);
  }, [activeProject]);

  const relinkVideoToProject = useCallback(async (projectId: string, videoFile: File): Promise<boolean> => {
    const list = getSavedProjects();
    const found = list.find((p) => p.id === projectId);
    if (!found) return false;

    await storeVideoBlob(projectId, videoFile, videoFile.name);
    found.sourceVideoName = videoFile.name;
    found.sourceVideoSize = videoFile.size;
    found.updatedAt = Date.now();
    saveProject(found);

    const updatedList = getSavedProjects();
    setProjects(updatedList);

    if (activeProject?.id === projectId) {
      setActiveProjectState({ ...found });
      cleanupBlobUrl();
      const objectUrl = URL.createObjectURL(videoFile);
      currentBlobUrlRef.current = objectUrl;
      setVideoSrc(objectUrl);
      setVideoFileName(videoFile.name);
      setVideoError(null);
    }
    return true;
  }, [activeProject?.id, cleanupBlobUrl]);

  // --- Batch 2: Pause-and-React Session Operations ---
  const startLiveSession = useCallback(async (): Promise<boolean> => {
    if (!activeProject || !videoSrc) {
      setVideoError('Please import or select a source video first.');
      return false;
    }

    setSessionState('preparing');

    // Ensure live camera/audio is active
    let stream = cameraStream;
    if (!stream) {
      const res = await cameraRecorder.getLiveStream({
        mode: recordingMode,
        quality: recordingQuality,
        audioDeviceId: audioConfig.selectedInputDeviceId,
      });
      if (res.stream) {
        stream = res.stream;
        setCameraStream(stream);
        setIsCameraPreviewActive(true);
      } else {
        setCameraError(res.error || 'Failed to start camera feed');
        setSessionState('idle');
        return false;
      }
    }

    // Start playing source video
    if (videoRef.current) {
      videoRef.current.play().catch(console.warn);
    }

    setSessionState('playing_source');
    return true;
  }, [activeProject, videoSrc, cameraStream, recordingMode, recordingQuality, audioConfig.selectedInputDeviceId, cameraRecorder]);

  const pauseAndReact = useCallback(async () => {
    if (sessionState !== 'playing_source') return;

    // 1. Pause source video at current position
    if (videoRef.current) {
      videoRef.current.pause();
    }

    // 2. Start recording reaction
    if (cameraStream) {
      setSessionState('recording_reaction');
      setCurrentReactionElapsed(0);
      await cameraRecorder.startRecording(cameraStream, (sec) => {
        setCurrentReactionElapsed(sec);
      });
    }
  }, [sessionState, cameraStream, cameraRecorder]);

  const stopReaction = useCallback(async (): Promise<ReactionSegment | null> => {
    if (sessionState !== 'recording_reaction' || !activeProject) return null;

    setSessionState('finalizing_reaction');

    const sourcePos = videoRef.current ? videoRef.current.currentTime : activeProject.lastPlaybackPosition;
    const segment = await cameraRecorder.stopRecording(activeProject.id, sourcePos, recordingMode);

    if (segment) {
      const currentSegments = activeProject.reactionSegments || [];
      const updatedSegments = [...currentSegments, segment];
      const updated = {
        ...activeProject,
        reactionSegments: updatedSegments,
        updatedAt: Date.now(),
      };
      saveProject(updated);
      setActiveProjectState(updated);
      setReviewingSegment(segment);
    }

    setSessionState('paused_between_segments');
    return segment;
  }, [sessionState, activeProject, recordingMode, cameraRecorder]);

  const resumeVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.warn);
    }
    setSessionState('playing_source');
    setReviewingSegment(null);
  }, []);

  const finishSession = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    cameraRecorder.stopStream();
    setCameraStream(null);
    setIsCameraPreviewActive(false);

    if (activeProject) {
      const segs = activeProject.reactionSegments || [];
      const totalDur = segs.reduce((acc, s) => acc + s.duration, 0);
      setSessionSummaryData({
        project: activeProject,
        segments: segs,
        totalDuration: totalDur,
      });
    }

    setSessionState('completed');
  }, [cameraRecorder, activeProject]);

  const discardReactionSegment = useCallback(
    async (segmentId: string) => {
      if (!activeProject) return;
      await removeSegmentBlob(segmentId);
      const filtered = (activeProject.reactionSegments || []).filter((s) => s.id !== segmentId);
      const updated = {
        ...activeProject,
        reactionSegments: filtered,
        updatedAt: Date.now(),
      };
      saveProject(updated);
      setActiveProjectState(updated);
      if (reviewingSegment?.id === segmentId) {
        setReviewingSegment(null);
      }
    },
    [activeProject, reviewingSegment?.id]
  );

  const closeSessionSummary = useCallback(() => {
    setSessionSummaryData(null);
    setSessionState('idle');
  }, []);

  // --- Batch 2: Layout Methods ---
  const updateLayout = useCallback(
    (partial: Partial<FacecamLayout>) => {
      setLayout((prev) => {
        const merged = { ...prev, ...partial };
        if (activeProject) {
          const updated = { ...activeProject, layout: merged, updatedAt: Date.now() };
          saveProject(updated);
          setActiveProjectState(updated);
        }
        return merged;
      });
    },
    [activeProject]
  );

  const applyLayoutPreset = useCallback(
    (preset: LayoutPreset) => {
      const presetValues = LAYOUT_PRESETS[preset];
      if (presetValues) {
        updateLayout(presetValues);
      }
    },
    [updateLayout]
  );

  const resetLayout = useCallback(() => {
    updateLayout(DEFAULT_LAYOUT);
  }, [updateLayout]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const merged = { ...prev, ...newSettings };
      saveAppSettings(merged);
      return merged;
    });
  }, []);

  const clearAllData = useCallback(async () => {
    await clearAllProjectStorage();
    setProjects([]);
    setActiveProjectState(null);
    setVideoSrc(null);
    setVideoFileName(null);
    setSessionState('idle');
  }, []);

  const toggleDeviceOrientation = useCallback(() => {
    setDeviceOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigateTo,
        projects,
        activeProject,
        createNewProject,
        openProject,
        renameProject,
        deleteProject,
        updateActiveProjectPosition,
        updateActiveProjectAspectRatio,
        relinkVideoToProject,
        videoSrc,
        videoFileName,
        isVideoLoading,
        videoError,
        setVideoError,
        videoRef,
        settings,
        updateSettings,
        clearAllData,
        deviceOrientation,
        toggleDeviceOrientation,
        showDeviceShell,
        setShowDeviceShell,

        // Batch 2: M5 Audio Routing
        audioConfig,
        updateAudioConfig,
        availableAudioDevices,
        refreshAudioDevices,
        micAudioLevel,
        isMicTesting,
        startMicTest,
        stopMicTest,
        isAudioSetupModalOpen,
        setIsAudioSetupModalOpen,

        // Batch 2: M6 & M7 Camera & Session Engine
        sessionState,
        recordingMode,
        setRecordingMode,
        recordingQuality,
        setRecordingQuality,
        cameraStream,
        cameraError,
        isCameraPreviewActive,
        toggleCameraPreview,
        currentReactionElapsed,
        startLiveSession,
        pauseAndReact,
        stopReaction,
        resumeVideo,
        finishSession,
        discardReactionSegment,
        reviewingSegment,
        setReviewingSegment,
        sessionSummaryData,
        closeSessionSummary,

        // Batch 2: M8 Layout Engine
        layout,
        updateLayout,
        applyLayoutPreset,
        resetLayout,
        isLayoutEditorOpen,
        setIsLayoutEditorOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
