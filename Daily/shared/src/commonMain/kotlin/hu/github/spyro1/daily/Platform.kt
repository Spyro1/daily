package hu.github.spyro1.daily

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform