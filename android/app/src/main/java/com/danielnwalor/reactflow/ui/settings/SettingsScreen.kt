package com.danielnwalor.reactflow.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.danielnwalor.reactflow.ui.theme.*
import com.danielnwalor.reactflow.ui.viewmodel.ReactFlowViewModel

/**
 * REACTFLOW - Settings Screen
 * Created by Engineer Daniel Nwalor
 */
@Composable
fun SettingsScreen(
    viewModel: ReactFlowViewModel,
    onNavigateToAbout: () -> Unit
) {
    val projects by viewModel.projects.collectAsState()
    val seekInterval by viewModel.seekIntervalSec.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Settings",
                style = MaterialTheme.typography.titleLarge,
                color = StudioTextPrimary
            )
        }

        // GENERAL SECTION
        item {
            Text(
                text = "GENERAL",
                style = MaterialTheme.typography.labelSmall,
                color = StudioAccent,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = StudioSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Theme Appearance", fontWeight = FontWeight.SemiBold, color = StudioTextPrimary)
                    Text("Dark Studio (Optimized for Android 14)", color = StudioTextSecondary, fontSize = 13.sp)
                }
            }
        }

        // VIDEO SECTION
        item {
            Text(
                text = "VIDEO & PLAYBACK",
                style = MaterialTheme.typography.labelSmall,
                color = StudioAccent,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = StudioSurface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Seek Step Interval", fontWeight = FontWeight.SemiBold, color = StudioTextPrimary)
                        Text("${seekInterval} seconds", color = StudioTextSecondary, fontSize = 13.sp)
                    }
                    Button(
                        onClick = {
                            val next = if (seekInterval == 5) 10 else 5
                            viewModel.setSeekInterval(next)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = StudioCard)
                    ) {
                        Text("Toggle", color = StudioAccent)
                    }
                }
            }
        }

        // STORAGE SECTION
        item {
            Text(
                text = "STORAGE",
                style = MaterialTheme.typography.labelSmall,
                color = StudioAccent,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = StudioSurface)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Project Storage", fontWeight = FontWeight.SemiBold, color = StudioTextPrimary)
                    Text("${projects.size} saved reaction projects", color = StudioTextSecondary, fontSize = 13.sp)
                }
            }
        }

        // ABOUT SECTION
        item {
            Text(
                text = "ABOUT",
                style = MaterialTheme.typography.labelSmall,
                color = StudioAccent,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToAbout() },
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = StudioSurface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("REACTFLOW v1.0.0", fontWeight = FontWeight.Bold, color = StudioTextPrimary)
                        Text("Created by Engineer Daniel Nwalor", color = StudioTextSecondary, fontSize = 13.sp)
                        Text("View author biography and philosophy", color = StudioAccent, fontSize = 12.sp)
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = StudioTextSecondary)
                }
            }
        }
    }
}
