/**
 * REACTFLOW - Projects Screen
 * Local project management with open, rename, and delete actions
 * Created by Engineer Daniel Nwalor
 */

import React, { useState, useRef } from 'react';
import {
  Film,
  Plus,
  Play,
  MoreVertical,
  Edit2,
  Trash2,
  Upload,
  AlertTriangle,
  Clock,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Project } from '../../types/project';

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const ProjectsScreen: React.FC = () => {
  const {
    projects,
    openProject,
    renameProject,
    deleteProject,
    createNewProject,
    relinkVideoToProject,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [relinkingProjectId, setRelinkingProjectId] = useState<string | null>(null);
  const relinkInputRef = useRef<HTMLInputElement>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter projects by search query
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sourceVideoName && p.sourceVideoName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartRename = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setNewTitle(proj.name);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && newTitle.trim()) {
      renameProject(editingProject.id, newTitle.trim());
      setEditingProject(null);
    }
  };

  const handleStartDelete = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingProject(proj);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await deleteProject(deletingProject.id);
      setDeletingProject(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRelinkClick = (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRelinkingProjectId(projId);
    relinkInputRef.current?.click();
  };

  const handleRelinkFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (relinkingProjectId && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await relinkVideoToProject(relinkingProjectId, file);
      setRelinkingProjectId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      await createNewProject(newProjectName || selectedFile.name, selectedFile);
    } else {
      await createNewProject(newProjectName || 'Reaction Project', undefined, 'tech');
    }
    setIsCreateModalOpen(false);
    setSelectedFile(null);
    setNewProjectName('');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 text-neutral-100 max-w-2xl mx-auto w-full">
      {/* Hidden Relink File Input */}
      <input
        ref={relinkInputRef}
        type="file"
        accept="video/*"
        onChange={handleRelinkFileSelected}
        className="hidden"
      />

      {/* Header and Actions */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Projects</h1>
          <p className="text-xs text-neutral-400">
            {projects.length} {projects.length === 1 ? 'saved project' : 'saved projects'}
          </p>
        </div>

        <button
          onClick={() => {
            setNewProjectName(`Reaction #${projects.length + 1}`);
            setIsCreateModalOpen(true);
          }}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search Bar if projects exist */}
      {projects.length > 2 && (
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      )}

      {/* Project List or Empty State */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Film className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">No projects saved yet</h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Create your first live reaction project by importing a source video.
            </p>
          </div>
          <button
            onClick={() => {
              setNewProjectName('First Reaction Session');
              setIsCreateModalOpen(true);
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reaction Project</span>
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 text-center text-xs text-neutral-400">
          No projects matching &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => openProject(proj.id)}
              className="rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 transition-all cursor-pointer active:scale-[0.99] group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {proj.name}
                    </h3>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {proj.aspectRatio}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 truncate">
                    {proj.sourceVideoName || 'Source file missing'}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs text-neutral-400">
                    <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-300">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {formatDuration(proj.lastPlaybackPosition)} / {formatDuration(proj.sourceVideoDuration)}
                    </span>
                    <span>·</span>
                    <span className="text-[11px] text-neutral-500">
                      {formatDate(proj.updatedAt)}
                    </span>
                    {proj.reactionSegments && proj.reactionSegments.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                          {proj.reactionSegments.length} takes
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Project Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleStartRename(proj, e)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    title="Rename project"
                    aria-label={`Rename ${proj.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleStartDelete(proj, e)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                    title="Delete project"
                    aria-label={`Delete ${proj.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center ml-1 group-hover:bg-sky-500 group-hover:text-white transition-all">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Inaccessible video warning & re-link affordance */}
              {!proj.sourceVideoUri && !proj.sourceVideoName && (
                <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-amber-300/90">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Video source disconnected
                  </span>
                  <button
                    onClick={(e) => handleRelinkClick(proj.id, e)}
                    className="underline hover:text-amber-200"
                  >
                    Re-link video
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rename Dialog Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title="Rename Project"
      >
        <form onSubmit={handleSaveRename} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              New Project Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md transition-all"
            >
              Save Name
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-white">&ldquo;{deletingProject?.name}&rdquo;</strong>?
            This will remove the project metadata and cached playback position. This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingProject(null)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* New Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Reaction Project"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g., Live Breakdown #1"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Source Video
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-dashed border-neutral-700 hover:border-neutral-500 bg-neutral-950/60 cursor-pointer text-center transition-all"
            >
              <Upload className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
              {selectedFile ? (
                <p className="text-xs font-semibold text-sky-400 truncate">{selectedFile.name}</p>
              ) : (
                <p className="text-xs text-neutral-400">Click to choose video file (or use default clip)</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md transition-all"
            >
              Create & Open
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
