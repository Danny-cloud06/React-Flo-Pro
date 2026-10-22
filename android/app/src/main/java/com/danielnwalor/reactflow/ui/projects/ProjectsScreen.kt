package com.danielnwalor.reactflow.ui.projects

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.danielnwalor.reactflow.data.model.Project
import com.danielnwalor.reactflow.ui.theme.*
import com.danielnwalor.reactflow.ui.viewmodel.ReactFlowViewModel

/**
 * REACTFLOW - Projects Screen
 * Created by Engineer Daniel Nwalor
 */
@Composable
fun ProjectsScreen(
    viewModel: ReactFlowViewModel,
    onOpenStudio: () -> Unit
) {
    val projects by viewModel.projects.collectAsState()
    var renamingProject by remember { mutableStateOf<Project?>(null) }
    var renameInput by remember { mutableStateOf("") }
    var deletingProject by remember { mutableStateOf<Project?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Saved Projects",
            style = MaterialTheme.typography.titleLarge,
            color = StudioTextPrimary
        )

        if (projects.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    text = "No saved projects yet.",
                    color = StudioTextSecondary,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(projects) { project ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                viewModel.openProject(project)
                                onOpenStudio()
                            },
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
                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = project.name,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = StudioTextPrimary
                                )
                                Text(
                                    text = project.sourceVideoDisplayName ?: "Source file",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = StudioTextSecondary
                                )
                                Text(
                                    text = "Status: ${project.status.displayName}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = StudioAccent
                                )
                            }

                            Row {
                                IconButton(onClick = {
                                    renamingProject = project
                                    renameInput = project.name
                                }) {
                                    Icon(Icons.Default.Edit, contentDescription = "Rename", tint = StudioTextSecondary)
                                }
                                IconButton(onClick = { deletingProject = project }) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = StudioError)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Rename Dialog
    renamingProject?.let { proj ->
        AlertDialog(
            onDismissRequest = { renamingProject = null },
            title = { Text("Rename Project") },
            text = {
                OutlinedTextField(
                    value = renameInput,
                    onValueChange = { renameInput = it },
                    label = { Text("Project Name") }
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    if (renameInput.isNotBlank()) {
                        viewModel.renameProject(proj.id, renameInput)
                    }
                    renamingProject = null
                }) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { renamingProject = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Delete Confirmation Dialog
    deletingProject?.let { proj ->
        AlertDialog(
            onDismissRequest = { deletingProject = null },
            title = { Text("Delete Project") },
            text = { Text("Are you sure you want to delete \"${proj.name}\"? This action cannot be undone.") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteProject(proj.id)
                    deletingProject = null
                }) {
                    Text("Delete", color = StudioError)
                }
            },
            dismissButton = {
                TextButton(onClick = { deletingProject = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}
