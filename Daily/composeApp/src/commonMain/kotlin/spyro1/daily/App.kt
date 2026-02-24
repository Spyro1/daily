package spyro1.daily

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier

import spyro1.daily.ui.theme.DailyTheme
import spyro1.daily.ui.features.dashboard.DashboardScreen


@Composable
fun App() {
    DailyTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            Scaffold { innerPadding ->
                Box(modifier = Modifier.padding(innerPadding)) {
                    DashboardScreen()
                }
            }
        }
    }
}