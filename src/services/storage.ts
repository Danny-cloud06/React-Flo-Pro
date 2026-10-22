/**
 * REACTFLOW - Local Storage & Media Repository
 * Provides persistent storage for project metadata, video media files, and recorded reaction segments.
 * Created by Engineer Daniel Nwalor
 */

import { Project, AppSettings, FacecamLayout, AudioDeviceConfig } from '../types/project';

const PROJECTS_KEY = 'reactflow_projects_v1';
const SETTINGS_KEY = 'reactflow_settings_v1';
const ACTIVE_PROJECT_ID_KEY = 'reactflow_active_project_id';
const DB_NAME = 'reactflow_media_db';
const DB_VERSION = 2;
const STORE_NAME = 'video_blobs';
const SEGMENTS_STORE = 'reaction_segment_blobs';

export const DEFAULT_LAYOUT: FacecamLayout = {
  preset: 'small_facecam',
  x: 72,
  y: 65,
  width: 25,
  height: 30,
  shape: 'rounded_rect',
  cornerRadius: 16,
  borderWidth: 2,
  borderColor: '#38BDF8',
  hasBorder: true,
  shadow: 'soft',
  isLocked: false,
  displayMode: 'freeze_overlay',
};

export const DEFAULT_AUDIO_CONFIG: AudioDeviceConfig = {
  playbackOutput: 'system',
  microphoneInput: 'auto',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultAspectRatio: '16:9',
  defaultPreviewFit: 'contain',
  seekInterval: 5,
  autoPauseOnBackground: true,
  hardwareAcceleration: true,
  defaultAudioConfig: DEFAULT_AUDIO_CONFIG,
  defaultLayout: DEFAULT_LAYOUT,
  defaultRecordingMode: 'camera',
};

// IndexedDB Helper
function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SEGMENTS_STORE)) {
        db.createObjectStore(SEGMENTS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeVideoBlob(projectId: string, blob: Blob, filename: string): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        id: projectId,
        blob,
        filename,
        storedAt: Date.now(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not persist video blob to IndexedDB:', err);
  }
}

export async function getVideoBlob(projectId: string): Promise<Blob | null> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(projectId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function removeVideoBlob(projectId: string): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(projectId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

// Reaction Segment Blobs
export async function storeSegmentBlob(segmentId: string, blob: Blob): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SEGMENTS_STORE, 'readwrite');
      const store = tx.objectStore(SEGMENTS_STORE);
      const req = store.put({
        id: segmentId,
        blob,
        storedAt: Date.now(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not persist segment blob to IndexedDB:', err);
  }
}

export async function getSegmentBlob(segmentId: string): Promise<Blob | null> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SEGMENTS_STORE, 'readonly');
      const store = tx.objectStore(SEGMENTS_STORE);
      const req = store.get(segmentId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function removeSegmentBlob(segmentId: string): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SEGMENTS_STORE, 'readwrite');
      const store = tx.objectStore(SEGMENTS_STORE);
      const req = store.delete(segmentId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

// Project Repository methods
export function getSavedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return [];
  } catch (err) {
    console.error('Error reading saved projects:', err);
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects:', err);
  }
}

export function getProjectById(id: string): Project | undefined {
  const projects = getSavedProjects();
  return projects.find((p) => p.id === id);
}

export function saveProject(project: Project): void {
  const projects = getSavedProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  const updatedProject = {
    ...project,
    updatedAt: Date.now(),
  };

  if (index >= 0) {
    projects[index] = updatedProject;
  } else {
    projects.unshift(updatedProject);
  }
  saveProjects(projects);
}

export async function deleteProjectById(id: string): Promise<void> {
  const projects = getSavedProjects();
  const target = projects.find((p) => p.id === id);
  if (target && target.reactionSegments) {
    for (const seg of target.reactionSegments) {
      await removeSegmentBlob(seg.id);
    }
  }

  const filtered = projects.filter((p) => p.id !== id);
  saveProjects(filtered);
  await removeVideoBlob(id);

  if (getActiveProjectId() === id) {
    setActiveProjectId(null);
  }
}

export function getActiveProjectId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveProjectId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    }
  } catch {
    // ignore
  }
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

// Storage stats calculation
export async function getStorageStats(): Promise<{ projectCount: number; mediaBytes: number; segmentCount: number }> {
  const projects = getSavedProjects();
  let mediaBytes = 0;
  let segmentCount = 0;

  for (const p of projects) {
    if (p.reactionSegments) {
      segmentCount += p.reactionSegments.length;
    }
  }

  try {
    const db = await openMediaDB();
    const records = await new Promise<any[]>((resolve) => {
      const tx = db.transaction([STORE_NAME, SEGMENTS_STORE], 'readonly');
      const store1 = tx.objectStore(STORE_NAME);
      const req1 = store1.getAll();
      req1.onsuccess = () => {
        const store2 = tx.objectStore(SEGMENTS_STORE);
        const req2 = store2.getAll();
        req2.onsuccess = () => {
          resolve([...(req1.result || []), ...(req2.result || [])]);
        };
        req2.onerror = () => resolve(req1.result || []);
      };
      req1.onerror = () => resolve([]);
    });

    for (const item of records) {
      if (item.blob && typeof item.blob.size === 'number') {
        mediaBytes += item.blob.size;
      }
    }
  } catch {
    for (const p of projects) {
      if (p.sourceVideoSize) mediaBytes += p.sourceVideoSize;
    }
  }

  return {
    projectCount: projects.length,
    mediaBytes,
    segmentCount,
  };
}

export async function clearAllProjectStorage(): Promise<void> {
  localStorage.removeItem(PROJECTS_KEY);
  localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
  try {
    const db = await openMediaDB();
    const tx = db.transaction([STORE_NAME, SEGMENTS_STORE], 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.objectStore(SEGMENTS_STORE).clear();
  } catch {
    // ignore
  }
}
