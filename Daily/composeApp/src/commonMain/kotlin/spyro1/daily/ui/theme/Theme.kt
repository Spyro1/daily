package spyro1.daily.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = LightPrimary,
    onPrimary = LightTextPrimary,
    secondary = LightSecondary,
    onSecondary = LightTextSecondary,
    tertiary = LightTertiary,
    error = LightError,
    background = LightBackground,
    surface = LightSurface
)

private val DarkColors = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = DarkTextPrimary,
    secondary = DarkSecondary,
    onSecondary = DarkTextSecondary,
    tertiary = DarkTertiary,
    error = DarkError,
    background = DarkBackground,
    surface = DarkSurface
)

@Composable
fun DailyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors

    MaterialTheme(
        colorScheme = colorScheme,
        typography = DailyTypography,
        content = content
    )
}