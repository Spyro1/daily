package spyro1.daily.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import spyro1.daily.database.tables.Accounts
import spyro1.daily.database.tables.Categories
import spyro1.daily.database.tables.ExternalIdentities
import spyro1.daily.database.tables.Icons
import spyro1.daily.database.tables.NotificationLogs
import spyro1.daily.database.tables.Profiles
import spyro1.daily.database.tables.Providers
import spyro1.daily.database.tables.Transactions

/**
 * Initializes the database connection pool via HikariCP and creates the schema using Exposed.
 *
 * Configuration is read from environment variables with sensible defaults for local development.
 */
object DatabaseFactory {

    fun init() {
        val database = Database.connect(createHikariDataSource())
        transaction(database) {
            SchemaUtils.create(
                Profiles,
                Providers,
                ExternalIdentities,
                Icons,
                Accounts,
                Categories,
                Transactions,
                NotificationLogs,
            )
        }
    }

    private fun createHikariDataSource(): HikariDataSource {
        val config = HikariConfig().apply {
            driverClassName = System.getenv("DB_DRIVER") ?: "org.postgresql.Driver"
            jdbcUrl = System.getenv("DB_URL") ?: "jdbc:postgresql://localhost:5433/daily"
            username = System.getenv("DB_USER") ?: "daily"
            password = System.getenv("DB_PASSWORD") ?: "daily"
            maximumPoolSize = System.getenv("DB_MAX_POOL_SIZE")?.toIntOrNull() ?: 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        return HikariDataSource(config)
    }

    /**
     * Executes a suspending database query within an Exposed transaction on the IO dispatcher.
     */
    suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }
}
