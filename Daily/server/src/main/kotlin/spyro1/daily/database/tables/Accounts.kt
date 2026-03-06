package spyro1.daily.database.tables

import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import java.util.UUID

object Accounts : UUIDTable("accounts") {
    val profileId = reference("profile_id", Profiles)
    val name = varchar("name", 255)
    val currencyCode = varchar("currency_code", 3) // ISO-4217
    val iconId = optReference("icon_id", Icons)
    val color = varchar("color", 7).nullable() // HEX e.g. #FF00AA
    val includeInTotal = bool("include_in_total").default(true)
    val isArchived = bool("is_archived").default(false)
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp)
    val updatedAt = timestamp("updated_at").defaultExpression(CurrentTimestamp)
    val deletedAt = timestamp("deleted_at").nullable()

    init {
        index(false, profileId, isArchived, deletedAt)
    }
}

class AccountEntity(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<AccountEntity>(Accounts)

    var profile by ProfileEntity referencedOn Accounts.profileId
    var name by Accounts.name
    var currencyCode by Accounts.currencyCode
    var icon by IconEntity optionalReferencedOn Accounts.iconId
    var color by Accounts.color
    var includeInTotal by Accounts.includeInTotal
    var isArchived by Accounts.isArchived
    var createdAt by Accounts.createdAt
    var updatedAt by Accounts.updatedAt
    var deletedAt by Accounts.deletedAt
}
