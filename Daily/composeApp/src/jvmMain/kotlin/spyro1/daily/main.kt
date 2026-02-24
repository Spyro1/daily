package spyro1.daily

import androidx.compose.ui.graphics.painter.BitmapPainter
import androidx.compose.ui.res.loadImageBitmap
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPosition
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState

fun main() = application {
    val windowState = rememberWindowState(
        size = DpSize(300.dp, 600.dp),
        position = WindowPosition(300.dp, 300.dp)
    )
    val iconStream = Thread.currentThread().contextClassLoader.getResourceAsStream("app_icon.png")
    val icon = iconStream?.let { BitmapPainter(loadImageBitmap(it)) }
    Window(
        title = "Daily",
        onCloseRequest = ::exitApplication,
        state = windowState,
        alwaysOnTop = true,
        icon = icon
    ) {
        App()
    }
}