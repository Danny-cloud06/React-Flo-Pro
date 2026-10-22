package com.danielnwalor.reactflow.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Home : Screen("home", "Home")
    object Studio : Screen("studio", "Studio")
    object Projects : Screen("projects", "Projects")
    object Settings : Screen("settings", "Settings")
    object About : Screen("about", "About")
}
