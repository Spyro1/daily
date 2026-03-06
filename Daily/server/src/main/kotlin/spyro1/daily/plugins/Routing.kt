package spyro1.daily.plugins

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("Daily API is running")
        }
        get("/health") {
            call.respondText("OK")
        }
    }
}
