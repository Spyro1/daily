package spyro1.daily

import kotlin.test.Test
import kotlin.test.assertTrue
import java.sql.Connection
import java.sql.DriverManager

class HelloWorldTest {
    @Test
    fun testDatabaseConnection() {
        val url = System.getenv("DB_URL") ?: "jdbc:postgresql://localhost:5433/daily"
        val user = System.getenv("DB_USER") ?: "daily"
        val password = System.getenv("DB_PASSWORD") ?: "daily"
        var connection: Connection? = null
        try {
            connection = DriverManager.getConnection(url, user, password)
            assertTrue(connection.isValid(2))
        } finally {
            connection?.close()
        }
    }
}