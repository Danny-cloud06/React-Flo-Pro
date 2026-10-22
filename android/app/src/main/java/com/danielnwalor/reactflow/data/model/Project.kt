package com.danielnwalor.reactflow.data.model

/**
 * REACTFLOW - Project & Reaction Data Models (Batch 1 & Batch 2)
 * Created by Engineer Daniel Nwalor
 */
data class Project(
    val id: String,
    val name: String,
    val sourceVideoUri: String?,
    val sourceVideoDisplayName: String?,
    val sourceVideoDurationMs: Long = 0L,
    val lastPlaybackPositionMs: Long = 0L,
    val createdAt: Long = System.currentTimeMillis(),
    val lastModifiedAt: Long = System.currentTimeMillis(),
    val preferredAspectRatio: AspectRatio = AspectRatio.RATIO_16_9,
    val status: ProjectStatus = ProjectStatus.IN_PROGRESS,
    val reactionSegments: List<ReactionSegment> = emptyList(),
    val layout: FacecamLayout = FacecamLayout(),
    val audioConfig: AudioDeviceConfig = AudioDeviceConfig()
)

data class ReactionSegment(
    val id: String,
    val projectId: String,
    val mediaUri: String,
    val durationMs: Long,
    val sourceVideoPositionMs: Long,
    val recordedAt: Long = System.currentTimeMillis(),
    val mode: String = "camera", // "camera" or "voice_only"
    val status: String = "saved"
)

data class FacecamLayout(
    val preset: String = "small_facecam",
    val xPercent: Float = 72f,
    val yPercent: Float = 65f,
    val widthPercent: Float = 25f,
    val heightPercent: Float = 30f,
    val shape: String = "rounded_rect", // "rounded_rect", "circle", "square"
    val cornerRadiusDp: Int = 16,
    val borderWidthDp: Int = 2,
    val borderColorHex: String = "#38BDF8",
    val hasBorder: Boolean = true,
    val shadow: String = "soft",
    val isLocked: Boolean = false,
    val displayMode: String = "freeze_overlay" // "freeze_overlay", "split_beside", "reaction_primary", "custom"
)

data class AudioDeviceConfig(
    val playbackOutput: String = "system", // "system", "wired", "bluetooth", "speaker"
    val microphoneInput: String = "auto"   // "auto", "builtin", "bluetooth", "wired"
)

enum class AspectRatio(val label: String) {
    RATIO_16_9("16:9"),
    RATIO_9_16("9:16"),
    RATIO_1_1("1:1"),
    FIT("Fit")
}

enum class ProjectStatus(val displayName: String) {
    DRAFT("Draft"),
    IN_PROGRESS("In Progress"),
    READY("Ready"),
    ARCHIVED("Archived")
}
