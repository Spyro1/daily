package spyro1.daily

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import spyro1.daily.database.DatabaseFactory
import spyro1.daily.plugins.configureHTTP
import spyro1.daily.plugins.configureMonitoring
import spyro1.daily.plugins.configureRouting
import spyro1.daily.plugins.configureSerialization

fun main() {
    val port = System.getenv("SERVER_PORT")?.toIntOrNull() ?: 8080
    embeddedServer(Netty, port = port, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    DatabaseFactory.init()
    configureSerialization()
    configureHTTP()
    configureMonitoring()
    configureRouting()
}