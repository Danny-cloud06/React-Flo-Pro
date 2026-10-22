package com.danielnwalor.reactflow.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = StudioPrimary,
    secondary = StudioAccent,
    background = StudioDark,
    surface = StudioSurface,
    surfaceVariant = StudioCard,
    onPrimary = StudioTextPrimary,
    onBackground = StudioTextPrimary,
    onSurface = StudioTextPrimary,
    onSurfaceVariant = StudioTextSecondary,
    outline = StudioDivider,
    error = StudioError
)

@Composable
fun REACTFLOWTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
