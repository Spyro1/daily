package spyro1.daily.database.tables

import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import java.util.UUID

object Providers : UUIDTable("providers") {
    val code = varchar("code", 50).uniqueIndex("uq_providers_code")
    val name = varchar("name", 255)
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp)
    val updatedAt = timestamp("updated_at").defaultExpression(CurrentTimestamp)
    val deletedAt = timestamp("deleted_at").nullable()
}

class ProviderEntity(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<ProviderEntity>(Providers)

    var code by Providers.code
    var name by Providers.name
    var createdAt by Providers.createdAt
    var updatedAt by Providers.updatedAt
    var deletedAt by Providers.deletedAt
}
