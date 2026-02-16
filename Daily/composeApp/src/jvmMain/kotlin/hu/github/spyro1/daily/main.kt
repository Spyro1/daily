package hu.github.spyro1.daily

import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "Daily",
    ) {
        App()
    }
}