package com.danielnwalor.reactflow.ui.viewmodel

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.danielnwalor.reactflow.camera.CameraRecorder
import com.danielnwalor.reactflow.data.model.*
import com.danielnwalor.reactflow.data.repository.ProjectRepository
import com.danielnwalor.reactflow.player.AudioRouter
import com.danielnwalor.reactflow.player.VideoPlayerController
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.UUID

enum class LiveSessionState {
    IDLE,
    PLAYING_SOURCE,
    RECORDING_REACTION,
    PAUSED_BETWEEN_SEGMENTS,
    COMPLETED
}

/**
 * REACTFLOW - Unified ViewModel (Batch 1 & Batch 2)
 * Bridges UI layer with ProjectRepository, VideoPlayerController, AudioRouter, and CameraRecorder.
 * Created by Engineer Daniel Nwalor
 */
class ReactFlowViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = ProjectRepository(application.applicationContext)
    val projects: StateFlow<List<Project>> = repository.projects

    val playerController = VideoPlayerController(application.applicationContext)
    val audioRouter = AudioRouter(application.applicationContext)
    val cameraRecorder = CameraRecorder(application.applicationContext)

    private val _activeProject = MutableStateFlow<Project?>(null)
    val activeProject: StateFlow<Project?> = _activeProject.asStateFlow()

    private val _seekIntervalSec = MutableStateFlow(5)
    val seekIntervalSec: StateFlow<Int> = _seekIntervalSec.asStateFlow()

    private val _sessionState = MutableStateFlow(LiveSessionState.IDLE)
    val sessionState: StateFlow<LiveSessionState> = _sessionState.asStateFlow()

    private val _isCameraOn = MutableStateFlow(false)
    val isCameraOn: StateFlow<Boolean> = _isCameraOn.asStateFlow()

    private val _recordingMode = MutableStateFlow("camera") // "camera" or "voice_only"
    val recordingMode: StateFlow<String> = _recordingMode.asStateFlow()

    init {
        viewModelScope.launch {
            while (isActive) {
                playerController.updateCurrentTime()
                delay(250)
            }
        }
    }

    fun openProject(project: Project) {
        _activeProject.value = project
        _sessionState.value = LiveSessionState.IDLE
        project.sourceVideoUri?.let { uriString ->
            try {
                val uri = Uri.parse(uriString)
                playerController.loadVideo(uri, project.lastPlaybackPositionMs)
            } catch (_: Exception) {}
        }
    }

    fun createProjectFromUri(name: String, uri: Uri, displayName: String, durationMs: Long = 0L) {
        val newProj = Project(
            id = UUID.randomUUID().toString(),
            name = name.ifBlank { displayName },
            sourceVideoUri = uri.toString(),
            sourceVideoDisplayName = displayName,
            sourceVideoDurationMs = durationMs,
            lastPlaybackPositionMs = 0L
        )
        repository.saveProject(newProj)
        openProject(newProj)
    }

    fun renameProject(projectId: String, newName: String) {
        repository.renameProject(projectId, newName)
        if (_activeProject.value?.id == projectId) {
            _activeProject.value = _activeProject.value?.copy(name = newName.trim())
        }
    }

    fun deleteProject(projectId: String) {
        repository.deleteProject(projectId)
        if (_activeProject.value?.id == projectId) {
            _activeProject.value = null
            playerController.release()
            _sessionState.value = LiveSessionState.IDLE
        }
    }

    fun updatePlaybackPosition(positionMs: Long) {
        _activeProject.value?.let { current ->
            repository.updatePlaybackPosition(current.id, positionMs)
            _activeProject.value = current.copy(lastPlaybackPositionMs = positionMs)
        }
    }

    fun setAspectRatio(ratio: AspectRatio) {
        _activeProject.value?.let { current ->
            val updated = current.copy(preferredAspectRatio = ratio)
            repository.saveProject(updated)
            _activeProject.value = updated
        }
    }

    fun setSeekInterval(seconds: Int) {
        _seekIntervalSec.value = seconds
    }

    fun toggleCamera() {
        _isCameraOn.value = !_isCameraOn.value
    }

    // --- Session Engine Operations ---
    fun startLiveSession() {
        _sessionState.value = LiveSessionState.PLAYING_SOURCE
        playerController.play()
    }

    fun pauseAndReact() {
        playerController.pause()
        _sessionState.value = LiveSessionState.RECORDING_REACTION
        cameraRecorder.startVoiceRecording()
    }

    fun stopReaction() {
        _activeProject.value?.let { current ->
            val segment = cameraRecorder.stopRecording(current.id, playerController.currentPositionMs.value, _recordingMode.value)
            if (segment != null) {
                val updatedSegments = current.reactionSegments + segment
                val updatedProject = current.copy(reactionSegments = updatedSegments)
                repository.saveProject(updatedProject)
                _activeProject.value = updatedProject
            }
        }
        _sessionState.value = LiveSessionState.PAUSED_BETWEEN_SEGMENTS
    }

    fun resumeVideo() {
        _sessionState.value = LiveSessionState.PLAYING_SOURCE
        playerController.play()
    }

    fun finishSession() {
        playerController.pause()
        cameraRecorder.release()
        _sessionState.value = LiveSessionState.COMPLETED
    }

    fun resetSession() {
        _sessionState.value = LiveSessionState.IDLE
    }

    override fun onCleared() {
        super.onCleared()
        playerController.release()
        cameraRecorder.release()
        audioRouter.stopMicMeter()
    }
}
