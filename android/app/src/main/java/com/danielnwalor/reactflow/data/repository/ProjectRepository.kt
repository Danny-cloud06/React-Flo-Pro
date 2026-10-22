package com.danielnwalor.reactflow.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.danielnwalor.reactflow.data.model.Project
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * REACTFLOW - Local Project Repository
 * Handles persistent project metadata using local storage.
 * Created by Engineer Daniel Nwalor
 */
class ProjectRepository(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("reactflow_projects_store", Context.MODE_PRIVATE)
    private val gson = Gson()
    private val projectsKey = "saved_projects_list"

    private val _projects = MutableStateFlow<List<Project>>(emptyList())
    val projects: StateFlow<List<Project>> = _projects.asStateFlow()

    init {
        loadProjects()
    }

    private fun loadProjects() {
        val json = prefs.getString(projectsKey, null)
        if (!json.isNullOrEmpty()) {
            try {
                val type = object : TypeToken<List<Project>>() {}.type
                val list: List<Project> = gson.fromJson(json, type)
                _projects.value = list.sortedByDescending { it.lastModifiedAt }
            } catch (e: Exception) {
                _projects.value = emptyList()
            }
        } else {
            _projects.value = emptyList()
        }
    }

    fun saveProject(project: Project) {
        val currentList = _projects.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == project.id }
        val updated = project.copy(lastModifiedAt = System.currentTimeMillis())

        if (index >= 0) {
            currentList[index] = updated
        } else {
            currentList.add(0, updated)
        }

        persistList(currentList)
    }

    fun deleteProject(projectId: String) {
        val currentList = _projects.value.filter { it.id != projectId }
        persistList(currentList)
    }

    fun renameProject(projectId: String, newName: String) {
        val currentList = _projects.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == projectId }
        if (index >= 0) {
            currentList[index] = currentList[index].copy(
                name = newName.trim(),
                lastModifiedAt = System.currentTimeMillis()
            )
            persistList(currentList)
        }
    }

    fun updatePlaybackPosition(projectId: String, positionMs: Long) {
        val currentList = _projects.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == projectId }
        if (index >= 0) {
            currentList[index] = currentList[index].copy(
                lastPlaybackPositionMs = positionMs,
                lastModifiedAt = System.currentTimeMillis()
            )
            persistList(currentList)
        }
    }

    private fun persistList(list: List<Project>) {
        val sorted = list.sortedByDescending { it.lastModifiedAt }
        _projects.value = sorted
        val json = gson.toJson(sorted)
        prefs.edit().putString(projectsKey, json).apply()
    }
}
