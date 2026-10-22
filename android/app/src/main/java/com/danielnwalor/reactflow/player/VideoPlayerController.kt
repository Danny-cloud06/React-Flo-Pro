package com.danielnwalor.reactflow.player

import android.content.Context
import android.net.Uri
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * REACTFLOW - Video Player Controller
 * Encapsulates AndroidX Media3 ExoPlayer lifecycle, playback, and state observation.
 * Created by Engineer Daniel Nwalor
 */
class VideoPlayerController(private val context: Context) {
    var exoPlayer: ExoPlayer? = null
        private set

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentPositionMs = MutableStateFlow(0L)
    val currentPositionMs: StateFlow<Long> = _currentPositionMs.asStateFlow()

    private val _durationMs = MutableStateFlow(0L)
    val durationMs: StateFlow<Long> = _durationMs.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    fun initializePlayer() {
        if (exoPlayer == null) {
            exoPlayer = ExoPlayer.Builder(context).build().apply {
                addListener(object : Player.Listener {
                    override fun onPlaybackStateChanged(playbackState: Int) {
                        when (playbackState) {
                            Player.STATE_BUFFERING -> _isLoading.value = true
                            Player.STATE_READY -> {
                                _isLoading.value = false
                                _durationMs.value = duration.coerceAtLeast(0L)
                            }
                            Player.STATE_ENDED -> {
                                _isPlaying.value = false
                                _isLoading.value = false
                            }
                            Player.STATE_IDLE -> {
                                _isLoading.value = false
                            }
                        }
                    }

                    override fun onIsPlayingChanged(playing: Boolean) {
                        _isPlaying.value = playing
                    }

                    override fun onPlayerError(error: PlaybackException) {
                        _isLoading.value = false
                        _isPlaying.value = false
                        _errorMessage.value = "Playback error: ${error.localizedMessage ?: "Unknown media error"}"
                    }
                })
            }
        }
    }

    fun loadVideo(uri: Uri, startPositionMs: Long = 0L) {
        initializePlayer()
        _errorMessage.value = null
        _isLoading.value = true

        val mediaItem = MediaItem.fromUri(uri)
        exoPlayer?.apply {
            setMediaItem(mediaItem)
            prepare()
            if (startPositionMs > 0) {
                seekTo(startPositionMs)
            }
            playWhenReady = false
        }
    }

    fun play() {
        exoPlayer?.play()
    }

    fun pause() {
        exoPlayer?.pause()
    }

    fun seekTo(positionMs: Long) {
        exoPlayer?.seekTo(positionMs.coerceAtLeast(0L))
        _currentPositionMs.value = positionMs
    }

    fun step(deltaMs: Long) {
        val current = exoPlayer?.currentPosition ?: 0L
        val maxDuration = exoPlayer?.duration ?: 0L
        val target = (current + deltaMs).coerceIn(0L, if (maxDuration > 0) maxDuration else Long.MAX_VALUE)
        seekTo(target)
    }

    fun updateCurrentTime() {
        exoPlayer?.let {
            if (it.playbackState == Player.STATE_READY) {
                _currentPositionMs.value = it.currentPosition
                _durationMs.value = it.duration.coerceAtLeast(0L)
            }
        }
    }

    fun release() {
        exoPlayer?.release()
        exoPlayer = null
        _isPlaying.value = false
        _isLoading.value = false
    }
}
