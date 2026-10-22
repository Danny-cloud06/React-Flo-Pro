package com.danielnwalor.reactflow

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.danielnwalor.reactflow.ui.about.AboutScreen
import com.danielnwalor.reactflow.ui.home.HomeScreen
import com.danielnwalor.reactflow.ui.navigation.Screen
import com.danielnwalor.reactflow.ui.projects.ProjectsScreen
import com.danielnwalor.reactflow.ui.settings.SettingsScreen
import com.danielnwalor.reactflow.ui.studio.StudioScreen
import com.danielnwalor.reactflow.ui.theme.*
import com.danielnwalor.reactflow.ui.viewmodel.ReactFlowViewModel

/**
 * REACTFLOW - Main Activity
 * Created by Engineer Daniel Nwalor
 */
class MainActivity : ComponentActivity() {
    private val viewModel: ReactFlowViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            REACTFLOWTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = StudioDark,
                    bottomBar = {
                        // Only show bottom nav bar on the 4 primary destinations
                        if (currentRoute != Screen.About.route) {
                            NavigationBar(
                                containerColor = StudioDark,
                                contentColor = StudioTextPrimary
                            ) {
                                NavigationBarItem(
                                    selected = currentRoute == Screen.Home.route,
                                    onClick = {
                                        navController.navigate(Screen.Home.route) {
                                            popUpTo(Screen.Home.route) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                                    label = { Text("Home") },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = StudioAccent,
                                        selectedTextColor = StudioAccent,
                                        indicatorColor = StudioSurface,
                                        unselectedIconColor = StudioTextSecondary,
                                        unselectedTextColor = StudioTextSecondary
                                    )
                                )

                                NavigationBarItem(
                                    selected = currentRoute == Screen.Studio.route,
                                    onClick = {
                                        navController.navigate(Screen.Studio.route) {
                                            popUpTo(Screen.Home.route) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    icon = { Icon(Icons.Default.Movie, contentDescription = "Studio") },
                                    label = { Text("Studio") },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = StudioAccent,
                                        selectedTextColor = StudioAccent,
                                        indicatorColor = StudioSurface,
                                        unselectedIconColor = StudioTextSecondary,
                                        unselectedTextColor = StudioTextSecondary
                                    )
                                )

                                NavigationBarItem(
                                    selected = currentRoute == Screen.Projects.route,
                                    onClick = {
                                        navController.navigate(Screen.Projects.route) {
                                            popUpTo(Screen.Home.route) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    icon = { Icon(Icons.Default.Folder, contentDescription = "Projects") },
                                    label = { Text("Projects") },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = StudioAccent,
                                        selectedTextColor = StudioAccent,
                                        indicatorColor = StudioSurface,
                                        unselectedIconColor = StudioTextSecondary,
                                        unselectedTextColor = StudioTextSecondary
                                    )
                                )

                                NavigationBarItem(
                                    selected = currentRoute == Screen.Settings.route,
                                    onClick = {
                                        navController.navigate(Screen.Settings.route) {
                                            popUpTo(Screen.Home.route) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                                    label = { Text("Settings") },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = StudioAccent,
                                        selectedTextColor = StudioAccent,
                                        indicatorColor = StudioSurface,
                                        unselectedIconColor = StudioTextSecondary,
                                        unselectedTextColor = StudioTextSecondary
                                    )
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Home.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(Screen.Home.route) {
                            HomeScreen(
                                viewModel = viewModel,
                                onNavigateToStudio = { navController.navigate(Screen.Studio.route) },
                                onNavigateToProjects = { navController.navigate(Screen.Projects.route) },
                                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
                            )
                        }

                        composable(Screen.Studio.route) {
                            StudioScreen(viewModel = viewModel)
                        }

                        composable(Screen.Projects.route) {
                            ProjectsScreen(
                                viewModel = viewModel,
                                onOpenStudio = { navController.navigate(Screen.Studio.route) }
                            )
                        }

                        composable(Screen.Settings.route) {
                            SettingsScreen(
                                viewModel = viewModel,
                                onNavigateToAbout = { navController.navigate(Screen.About.route) }
                            )
                        }

                        composable(Screen.About.route) {
                            AboutScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
