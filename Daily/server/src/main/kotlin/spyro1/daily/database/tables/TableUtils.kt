package spyro1.daily.database.tables

import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.QueryBuilder

/**
 * SQL CURRENT_TIMESTAMP expression typed for [kotlinx.datetime.Instant] columns.
 *
 * Used as a `defaultExpression` on Exposed `timestamp()` columns from the kotlin-datetime module,
 * ensuring the database itself generates the timestamp rather than the application.
 */
object CurrentTimestamp : Expression<Instant>() {
    override fun toQueryBuilder(queryBuilder: QueryBuilder) = queryBuilder { append("CURRENT_TIMESTAMP") }
}
