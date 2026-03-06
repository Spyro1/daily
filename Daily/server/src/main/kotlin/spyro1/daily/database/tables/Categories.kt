package spyro1.daily.database.tables

import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import java.util.UUID

object Categories : UUIDTable("categories") {
    val profileId = reference("profile_id", Profiles)
    val parentId = optReference("parent_id", Categories) // self-referencing hierarchy
    val name = varchar("name", 255)
    val categoryType = varchar("category_type", 20) // "expense" | "income"
    val isSystemCategory = bool("is_system_category").default(false)
    val iconId = optReference("icon_id", Icons)
    val color = varchar("color", 7).nullable() // HEX
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp)
    val updatedAt = timestamp("updated_at").defaultExpression(CurrentTimestamp)
    val deletedAt = timestamp("deleted_at").nullable()

    init {
        index(false, profileId, parentId, deletedAt)
    }
}

class CategoryEntity(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<CategoryEntity>(Categories)

    var profile by ProfileEntity referencedOn Categories.profileId
    var parent by CategoryEntity optionalReferencedOn Categories.parentId
    var name by Categories.name
    var categoryType by Categories.categoryType
    var isSystemCategory by Categories.isSystemCategory
    var icon by IconEntity optionalReferencedOn Categories.iconId
    var color by Categories.color
    var createdAt by Categories.createdAt
    var updatedAt by Categories.updatedAt
    var deletedAt by Categories.deletedAt
}
