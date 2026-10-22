package com.danielnwalor.reactflow.ui.home

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.danielnwalor.reactflow.data.model.Project
import com.danielnwalor.reactflow.ui.theme.*
import com.danielnwalor.reactflow.ui.viewmodel.ReactFlowViewModel

/**
 * REACTFLOW - Home Screen
 * Created by Engineer Daniel Nwalor
 */
@Composable
fun HomeScreen(
    viewModel: ReactFlowViewModel,
    onNavigateToStudio: () -> Unit,
    onNavigateToProjects: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val projects by viewModel.projects.collectAsState()
    val activeProject by viewModel.activeProject.collectAsState()

    val videoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let {
            val name = it.lastPathSegment ?: "Reaction Source"
            viewModel.createProjectFromUri(name, it, name)
            onNavigateToStudio()
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioDark)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 24.dp)
    ) {
        // Branding & Description
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "REACTFLOW",
                    style = MaterialTheme.typography.titleLarge,
                    fontSize = 28.sp,
                    color = StudioTextPrimary
                )
                Text(
                    text = "Your space for authentic live reactions.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = StudioTextSecondary
                )
            }
        }

        // Prominent NEW REACTION Button
        item {
            Button(
                onClick = { videoPickerLauncher.launch(arrayOf("video/*")) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = StudioPrimary)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "NEW REACTION",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Color.White
                )
            }
        }

        // CONTINUE PROJECT Section
        val continueTarget = activeProject ?: projects.firstOrNull()
        if (continueTarget != null) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "CONTINUE PROJECT",
                        style = MaterialTheme.typography.labelSmall,
                        color = StudioTextSecondary,
                        fontWeight = FontWeight.Bold
                    )
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                viewModel.openProject(continueTarget)
                                onNavigateToStudio()
                            },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = StudioSurface)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = continueTarget.name,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = StudioTextPrimary
                                )
                                Text(
                                    text = continueTarget.sourceVideoDisplayName ?: "Source Video",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = StudioTextSecondary
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(StudioPrimary),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.PlayArrow,
                                    contentDescription = "Resume",
                                    tint = Color.White
                                )
                            }
                        }
                    }
                }
            }
        }

        // Shortcuts Grid
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateToStudio() },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = StudioSurface)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.VideoCameraFront, contentDescription = null, tint = StudioAccent)
                        Text("Studio", fontWeight = FontWeight.SemiBold, color = StudioTextPrimary)
                    }
                }

                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateToSettings() },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = StudioSurface)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.Settings, contentDescription = null, tint = StudioTextSecondary)
                        Text("Settings", fontWeight = FontWeight.SemiBold, color = StudioTextPrimary)
                    }
                }
            }
        }

        // RECENT PROJECTS Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "RECENT PROJECTS",
                    style = MaterialTheme.typography.labelSmall,
                    color = StudioTextSecondary,
                    fontWeight = FontWeight.Bold
                )
                if (projects.isNotEmpty()) {
                    TextButton(onClick = onNavigateToProjects) {
                        Text("View all", color = StudioAccent, fontSize = 12.sp)
                    }
                }
            }
        }

        if (projects.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = StudioSurface)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.VideoFile,
                            contentDescription = null,
                            tint = StudioTextSecondary,
                            modifier = Modifier.size(36.dp)
                        )
                        Text(
                            text = "No reaction projects yet",
                            style = MaterialTheme.typography.titleMedium,
                            color = StudioTextPrimary
                        )
                        Text(
                            text = "Import a video to begin your first live reaction.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = StudioTextSecondary
                        )
                    }
                }
            }
        } else {
            items(projects.take(3)) { project ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            viewModel.openProject(project)
                            onNavigateToStudio()
                        },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = StudioSurface)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            Text(project.name, fontWeight = FontWeight.SemiBold, color = StudioTextPrimary)
                            Text(
                                project.sourceVideoDisplayName ?: "Source file",
                                style = MaterialTheme.typography.bodyMedium,
                                color = StudioTextSecondary
                            )
                        }
                        Icon(Icons.Default.PlayArrow, contentDescription = null, tint = StudioAccent)
                    }
                }
            }
        }
    }
}
