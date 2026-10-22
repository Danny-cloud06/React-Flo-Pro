package com.danielnwalor.reactflow.ui.about

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.danielnwalor.reactflow.R
import com.danielnwalor.reactflow.ui.theme.*

/**
 * REACTFLOW - About Screen
 * Creator Profile & Philosophy of Engineer Daniel Nwalor
 */
@Composable
fun AboutScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioDark)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = StudioTextPrimary)
        }

        // Header
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                text = "REACTFLOW",
                style = MaterialTheme.typography.titleLarge,
                fontSize = 26.sp,
                color = StudioTextPrimary
            )
            Text(
                text = "LIVE REACTION RECORDING STUDIO",
                style = MaterialTheme.typography.labelSmall,
                color = StudioAccent,
                fontWeight = FontWeight.Bold
            )
        }

        // Creator Card with Photo
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = StudioSurface)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Profile Photo + Heading
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.creator_profile),
                        contentDescription = "Engineer Daniel Nwalor",
                        modifier = Modifier
                            .size(80.dp)
                            .clip(RoundedCornerShape(18.dp))
                            .border(2.dp, StudioAccent, RoundedCornerShape(18.dp)),
                        contentScale = ContentScale.Crop
                    )

                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "Created by",
                            style = MaterialTheme.typography.labelSmall,
                            color = StudioAccent,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Engineer Daniel Nwalor",
                            style = MaterialTheme.typography.titleMedium,
                            fontSize = 18.sp,
                            color = StudioTextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                HorizontalDivider(color = StudioDivider)

                // Biography
                Text(
                    text = "Daniel Nwalor is a young computer engineer driven by curiosity, creativity, and the desire to turn ambitious ideas into working technology. REACTFLOW reflects his interest in building practical tools that make content creation more accessible.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = StudioTextSecondary,
                    lineHeight = 22.sp
                )

                // Philosophy Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = StudioCard)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "Philosophy:",
                            style = MaterialTheme.typography.labelSmall,
                            color = StudioTextSecondary
                        )
                        Text(
                            text = "THINK BEYOND THE ORDINARY. ENGINEER WHAT COMES NEXT.",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = StudioAccent,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }

        // App Specifications
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = StudioSurface)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("Application: REACTFLOW v1.0.0", color = StudioTextSecondary, fontSize = 13.sp)
                Text("Target Device: TECNO Camon 20 Pro · Android 14", color = StudioTextSecondary, fontSize = 13.sp)
                Text("Architecture: Jetpack Compose with Material 3 & AndroidX Media3", color = StudioTextSecondary, fontSize = 13.sp)
                Text("© 2026 REACTFLOW. All rights reserved.", color = StudioTextSecondary, fontSize = 12.sp)
            }
        }
    }
}
