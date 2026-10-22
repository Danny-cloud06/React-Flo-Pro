package com.danielnwalor.reactflow.camera

import android.content.Context
import android.media.MediaRecorder
import android.os.Build
import com.danielnwalor.reactflow.data.model.ReactionSegment
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.util.UUID

/**
 * REACTFLOW - Front Camera & Voice Recorder (Milestone M6)
 * Handles reaction video and voice-only take recordings.
 * Created by Engineer Daniel Nwalor
 */
class CameraRecorder(private val context: Context) {
    private var mediaRecorder: MediaRecorder? = null
    private var currentOutputFile: File? = null
    private var recordingStartTime = 0L

    private val _isRecording = MutableStateFlow(false)
    val isRecording: StateFlow<Boolean> = _isRecording.asStateFlow()

    private val _elapsedSeconds = MutableStateFlow(0)
    val elapsedSeconds: StateFlow<Int> = _elapsedSeconds.asStateFlow()

    fun startVoiceRecording(): Boolean {
        return try {
            val outputDir = File(context.filesDir, "reactions").apply { mkdirs() }
            val file = File(outputDir, "reaction_${System.currentTimeMillis()}.m4a")
            currentOutputFile = file

            mediaRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(context)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile(file.absolutePath)
                prepare()
                start()
            }

            recordingStartTime = System.currentTimeMillis()
            _isRecording.value = true
            true
        } catch (e: Exception) {
            _isRecording.value = false
            false
        }
    }

    fun stopRecording(projectId: String, sourcePositionMs: Long, mode: String = "camera"): ReactionSegment? {
        if (!_isRecording.value || currentOutputFile == null) return null

        try {
            mediaRecorder?.stop()
            mediaRecorder?.release()
        } catch (_: Exception) {}

        mediaRecorder = null
        _isRecording.value = false

        val duration = System.currentTimeMillis() - recordingStartTime
        val segment = ReactionSegment(
            id = UUID.randomUUID().toString(),
            projectId = projectId,
            mediaUri = currentOutputFile?.toURI().toString(),
            durationMs = duration.coerceAtLeast(500L),
            sourceVideoPositionMs = sourcePositionMs,
            recordedAt = System.currentTimeMillis(),
            mode = mode
        )

        currentOutputFile = null
        return segment
    }

    fun release() {
        try {
            mediaRecorder?.release()
        } catch (_: Exception) {}
        mediaRecorder = null
        _isRecording.value = false
    }
}
