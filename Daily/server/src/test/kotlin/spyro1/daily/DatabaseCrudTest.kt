package spyro1.daily

import kotlin.test.Test
import kotlin.test.assertEquals
import java.sql.Connection
import java.sql.DriverManager
import java.sql.Statement

class DatabaseCrudTest {

    private fun getConnection(): Connection {
        val url = System.getenv("DB_URL") ?: "jdbc:postgresql://localhost:5433/daily"
        val user = System.getenv("DB_USER") ?: "daily"
        val password = System.getenv("DB_PASSWORD") ?: "daily"
        return DriverManager.getConnection(url, user, password)
    }

    @Test
    fun testCreateReadUpdateDelete() {
        val connection = getConnection()
        val statement: Statement = connection.createStatement()

        statement.execute("CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name VARCHAR(100))")
        
        statement.execute("INSERT INTO test_table (name) VALUES ('Test Name')")
        
        val resultSet = statement.executeQuery("SELECT name FROM test_table WHERE id = 1")
        resultSet.next()
        assertEquals("Test Name", resultSet.getString("name"))

        statement.execute("UPDATE test_table SET name = 'Updated Name' WHERE id = 1")
        val updatedResultSet = statement.executeQuery("SELECT name FROM test_table WHERE id = 1")
        updatedResultSet.next()
        assertEquals("Updated Name", updatedResultSet.getString("name"))

        statement.execute("DELETE FROM test_table WHERE id = 1")
        val deletedResultSet = statement.executeQuery("SELECT COUNT(*) FROM test_table WHERE id = 1")
        deletedResultSet.next()
        assertEquals(0, deletedResultSet.getInt(1))

        statement.execute("DROP TABLE test_table")
        connection.close()
    }
}