package spyro1.daily.database.tables

import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import java.util.UUID

object Profiles : UUIDTable("profiles") {
    val email = varchar("email", 255).nullable()
    val displayName = varchar("display_name", 255)
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp)
    val updatedAt = timestamp("updated_at").defaultExpression(CurrentTimestamp)
    val deletedAt = timestamp("deleted_at").nullable()

    init {
        index(false, updatedAt)
    }
}

class ProfileEntity(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<ProfileEntity>(Profiles)

    var email by Profiles.email
    var displayName by Profiles.displayName
    var createdAt by Profiles.createdAt
    var updatedAt by Profiles.updatedAt
    var deletedAt by Profiles.deletedAt
}
