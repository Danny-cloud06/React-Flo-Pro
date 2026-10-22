package com.danielnwalor.reactflow.player

import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Build
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * REACTFLOW - Android Audio Router & Microphone Level Meter
 * Supports independent playback output and voice recording microphone selection.
 * Created by Engineer Daniel Nwalor
 */
class AudioRouter(private val context: Context) {
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    private val _micAudioLevel = MutableStateFlow(0)
    val micAudioLevel: StateFlow<Int> = _micAudioLevel.asStateFlow()

    private var audioRecord: AudioRecord? = null
    private var meterJob: Job? = null
    private val coroutineScope = CoroutineScope(Dispatchers.Default)

    /**
     * Enumerate physically detected output and input audio devices
     */
    fun getAvailableDevices(): Pair<List<AudioDeviceInfo>, List<AudioDeviceInfo>> {
        val outputs = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS).toList()
        } else emptyList()

        val inputs = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS).toList()
        } else emptyList()

        return Pair(outputs, inputs)
    }

    /**
     * Route playback to wired earpiece, bluetooth, or speaker independently
     */
    fun routePlaybackOutput(targetRoute: String): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val available = audioManager.availableCommunicationDevices
            val targetDevice = when (targetRoute) {
                "wired" -> available.find { it.type == AudioDeviceInfo.TYPE_WIRED_HEADSET || it.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES }
                "bluetooth" -> available.find { it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO || it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP }
                "speaker" -> available.find { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }
                else -> null
            }
            return if (targetDevice != null) {
                audioManager.setCommunicationDevice(targetDevice)
            } else {
                audioManager.clearCommunicationDevice()
                true
            }
        } else {
            when (targetRoute) {
                "speaker" -> {
                    audioManager.isSpeakerphoneOn = true
                }
                "bluetooth" -> {
                    audioManager.startBluetoothSco()
                    audioManager.isBluetoothScoOn = true
                }
                else -> {
                    audioManager.isSpeakerphoneOn = false
                    audioManager.isBluetoothScoOn = false
                }
            }
            return true
        }
    }

    /**
     * Start live microphone level meter
     */
    fun startMicMeter(preferredMic: String = "builtin") {
        stopMicMeter()
        meterJob = coroutineScope.launch {
            try {
                val sampleRate = 44100
                val channelConfig = android.media.AudioFormat.CHANNEL_IN_MONO
                val audioFormat = android.media.AudioFormat.ENCODING_PCM_16BIT
                val minBufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)

                audioRecord = AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    sampleRate,
                    channelConfig,
                    audioFormat,
                    minBufferSize.coerceAtLeast(2048)
                )

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    val inputs = audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS)
                    val selectedInput = when (preferredMic) {
                        "builtin" -> inputs.find { it.type == AudioDeviceInfo.TYPE_BUILTIN_MIC }
                        "wired" -> inputs.find { it.type == AudioDeviceInfo.TYPE_WIRED_HEADSET }
                        "bluetooth" -> inputs.find { it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO }
                        else -> null
                    }
                    if (selectedInput != null) {
                        audioRecord?.preferredDevice = selectedInput
                    }
                }

                audioRecord?.startRecording()
                val buffer = ShortArray(1024)

                while (isActive && audioRecord?.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                    val read = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (read > 0) {
                        var sum = 0.0
                        for (i in 0 until read) {
                            sum += buffer[i] * buffer[i]
                        }
                        val rms = Math.sqrt(sum / read)
                        val level = ((rms / 32767.0) * 100 * 2.5).coerceIn(0.0, 100.0).toInt()
                        _micAudioLevel.value = level
                    }
                    delay(50)
                }
            } catch (e: Exception) {
                _micAudioLevel.value = 0
            }
        }
    }

    fun stopMicMeter() {
        meterJob?.cancel()
        meterJob = null
        try {
            audioRecord?.stop()
            audioRecord?.release()
        } catch (_: Exception) {}
        audioRecord = null
        _micAudioLevel.value = 0
    }
}
