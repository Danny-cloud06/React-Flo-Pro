package com.danielnwalor.reactflow.ui.studio

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.ui.PlayerView
import com.danielnwalor.reactflow.ui.theme.*
import com.danielnwalor.reactflow.ui.viewmodel.LiveSessionState
import com.danielnwalor.reactflow.ui.viewmodel.ReactFlowViewModel

/**
 * REACTFLOW - Studio Screen (Batch 1 & Batch 2)
 * Video Player with Pause-and-React Session Engine, Audio Routing, and Live Facecam.
 * Created by Engineer Daniel Nwalor
 */
@Composable
fun StudioScreen(viewModel: ReactFlowViewModel) {
    val activeProject by viewModel.activeProject.collectAsState()
    val isPlaying by viewModel.playerController.isPlaying.collectAsState()
    val currentPositionMs by viewModel.playerController.currentPositionMs.collectAsState()
    val durationMs by viewModel.playerController.durationMs.collectAsState()
    val isLoading by viewModel.playerController.isLoading.collectAsState()
    val errorMessage by viewModel.playerController.errorMessage.collectAsState()
    val seekIntervalSec by viewModel.seekIntervalSec.collectAsState()
    val sessionState by viewModel.sessionState.collectAsState()
    val isCameraOn by viewModel.isCameraOn.collectAsState()
    val micLevel by viewModel.audioRouter.micAudioLevel.collectAsState()

    var showAudioDialog by remember { mutableStateOf(false) }

    val videoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let {
            val name = it.lastPathSegment ?: "Reaction Source"
            viewModel.createProjectFromUri(name, it, name)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        if (activeProject != null) {
            // Top Toolbar: Project name, Audio Setup button, Camera button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = activeProject?.name ?: "Studio Session",
                        style = MaterialTheme.typography.titleMedium,
                        color = StudioTextPrimary
                    )
                    Text(
                        text = activeProject?.sourceVideoDisplayName ?: "",
                        style = MaterialTheme.typography.bodyMedium,
                        color = StudioTextSecondary
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(onClick = { showAudioDialog = true }) {
                        Icon(Icons.Default.Headphones, contentDescription = "Audio Setup", tint = StudioAccent)
                    }
                    IconButton(onClick = { viewModel.toggleCamera() }) {
                        Icon(
                            if (isCameraOn) Icons.Default.Videocam else Icons.Default.VideocamOff,
                            contentDescription = "Toggle Camera",
                            tint = if (isCameraOn) StudioAccent else StudioTextSecondary
                        )
                    }
                }
            }

            // Media Stage Container (ExoPlayer + Facecam Layer)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.Black),
                contentAlignment = Alignment.Center
            ) {
                AndroidView(
                    factory = { ctx ->
                        PlayerView(ctx).apply {
                            player = viewModel.playerController.exoPlayer
                            useController = false
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )

                // Facecam Layer
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(12.dp)
                        .size(90.dp, 105.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF0F172A))
                        .border(2.dp, StudioAccent, RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    if (isCameraOn) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Default.Face, contentDescription = null, tint = StudioAccent, modifier = Modifier.size(28.dp))
                            Text("Facecam", fontSize = 10.sp, color = StudioTextPrimary)
                        }
                    } else {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Default.Mic, contentDescription = null, tint = StudioTextSecondary, modifier = Modifier.size(24.dp))
                            Text("Voice Mode", fontSize = 10.sp, color = StudioTextSecondary)
                        }
                    }

                    if (sessionState == LiveSessionState.RECORDING_REACTION) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .padding(4.dp)
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(Color.Red)
                        )
                    }
                }

                if (isLoading) {
                    CircularProgressIndicator(color = StudioAccent)
                }
            }

            // CORE LIVE SESSION CONTROLS (M7 Engine)
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = StudioSurface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.Center
                ) {
                    when (sessionState) {
                        LiveSessionState.IDLE -> {
                            Button(
                                onClick = { viewModel.startLiveSession() },
                                modifier = Modifier.fillMaxWidth().height(48.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626))
                            ) {
                                Icon(Icons.Default.RadioButtonChecked, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("START LIVE REACTION SESSION", fontWeight = FontWeight.Bold)
                            }
                        }
                        LiveSessionState.PLAYING_SOURCE -> {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { viewModel.pauseAndReact() },
                                    modifier = Modifier.weight(1f).height(48.dp),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626))
                                ) {
                                    Icon(Icons.Default.PauseCircle, contentDescription = null)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("PAUSE & REACT", fontWeight = FontWeight.Bold)
                                }
                                Button(
                                    onClick = { viewModel.finishSession() },
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = StudioCard)
                                ) {
                                    Text("Finish", color = StudioTextSecondary)
                                }
                            }
                        }
                        LiveSessionState.RECORDING_REACTION -> {
                            Button(
                                onClick = { viewModel.stopReaction() },
                                modifier = Modifier.fillMaxWidth().height(48.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B))
                            ) {
                                Icon(Icons.Default.StopCircle, contentDescription = null, tint = Color.Black)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("STOP REACTION & SAVE TAKE", color = Color.Black, fontWeight = FontWeight.Bold)
                            }
                        }
                        LiveSessionState.PAUSED_BETWEEN_SEGMENTS -> {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { viewModel.resumeVideo() },
                                    modifier = Modifier.weight(1f).height(48.dp),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = StudioPrimary)
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("RESUME VIDEO", fontWeight = FontWeight.Bold)
                                }
                                Button(
                                    onClick = { viewModel.finishSession() },
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = StudioCard)
                                ) {
                                    Text("Finish", color = StudioTextSecondary)
                                }
                            }
                        }
                        LiveSessionState.COMPLETED -> {
                            Button(
                                onClick = { viewModel.resetSession() },
                                modifier = Modifier.fillMaxWidth().height(48.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = StudioCard)
                            ) {
                                Text("Session Completed · Reset", color = StudioAccent, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // Seek Bar & Playback Controls
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = StudioSurface)
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val sliderPosition = if (durationMs > 0) {
                        (currentPositionMs.toFloat() / durationMs.toFloat()).coerceIn(0f, 1f)
                    } else 0f

                    Slider(
                        value = sliderPosition,
                        onValueChange = { frac ->
                            val targetMs = (frac * durationMs).toLong()
                            viewModel.playerController.seekTo(targetMs)
                            viewModel.updatePlaybackPosition(targetMs)
                        },
                        colors = SliderDefaults.colors(
                            thumbColor = StudioAccent,
                            activeTrackColor = StudioPrimary,
                            inactiveTrackColor = StudioCard
                        )
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(formatMs(currentPositionMs), color = StudioTextPrimary, fontSize = 12.sp)
                        Text(formatMs(durationMs), color = StudioTextSecondary, fontSize = 12.sp)
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { viewModel.playerController.step(-seekIntervalSec * 1000L) }) {
                            Icon(Icons.Default.Replay, contentDescription = "Step Back", tint = StudioTextSecondary)
                        }

                        Box(
                            modifier = Modifier.size(48.dp).clip(CircleShape).background(StudioPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            IconButton(onClick = {
                                if (isPlaying) viewModel.playerController.pause()
                                else viewModel.playerController.play()
                            }) {
                                Icon(
                                    if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                    contentDescription = null,
                                    tint = Color.White
                                )
                            }
                        }

                        IconButton(onClick = { viewModel.playerController.step(seekIntervalSec * 1000L) }) {
                            Icon(Icons.Default.Forward10, contentDescription = "Step Forward", tint = StudioTextSecondary)
                        }
                    }
                }
            }
        } else {
            // Empty State
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = StudioSurface)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Icon(Icons.Default.Movie, contentDescription = null, tint = StudioAccent, modifier = Modifier.size(48.dp))
                        Text("Studio Workspace", style = MaterialTheme.typography.titleLarge, color = StudioTextPrimary)
                        Text("Select a video from your device to begin.", style = MaterialTheme.typography.bodyMedium, color = StudioTextSecondary)
                        Button(
                            onClick = { videoPickerLauncher.launch(arrayOf("video/*")) },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = StudioPrimary)
                        ) {
                            Icon(Icons.Default.Upload, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Import Video")
                        }
                    }
                }
            }
        }
    }

    // Audio Setup Dialog
    if (showAudioDialog) {
        AlertDialog(
            onDismissRequest = { showAudioDialog = false },
            title = { Text("Audio Routing & Microphone") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("1. Playback Output: Wired Earpiece / Bluetooth / Speaker", fontSize = 12.sp, color = StudioTextSecondary)
                    Text("2. Microphone: Built-in Phone Mic / Headset Mic", fontSize = 12.sp, color = StudioTextSecondary)
                    Text("Live Mic Level: $micLevel%", fontSize = 12.sp, color = StudioAccent, fontWeight = FontWeight.Bold)
                }
            },
            confirmButton = {
                TextButton(onClick = { showAudioDialog = false }) {
                    Text("Done")
                }
            }
        )
    }
}

private fun formatMs(ms: Long): String {
    val totalSec = ms / 1000
    val m = totalSec / 60
    val s = totalSec % 60
    return String.format("%d:%02d", m, s)
}
