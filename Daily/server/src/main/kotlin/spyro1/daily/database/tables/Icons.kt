package spyro1.daily.database.tables

import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import java.util.UUID

object Icons : UUIDTable("icons") {
    val name = varchar("name", 255)
    val svgContent = text("svg_content").nullable()
    val isSystem = bool("is_system").default(false)
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp)
    val updatedAt = timestamp("updated_at").defaultExpression(CurrentTimestamp)
    val deletedAt = timestamp("deleted_at").nullable()
}

class IconEntity(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<IconEntity>(Icons)

    var name by Icons.name
    var svgContent by Icons.svgContent
    var isSystem by Icons.isSystem
    var createdAt by Icons.createdAt
    var updatedAt by Icons.updatedAt
    var deletedAt by Icons.deletedAt
}
