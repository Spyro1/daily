package spyro1.daily.database.tables

import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import java.util.UUID

object ExternalIdentities : UUIDTable("external_identities") {
    val profileId = reference("profile_id", Profiles)
    val providerId = reference("provider_id", Providers)
    val providerUserId = varchar("provider_user_id", 255)
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp)
    val updatedAt = timestamp("updated_at").defaultExpression(CurrentTimestamp)
    val deletedAt = timestamp("deleted_at").nullable()

    init {
        uniqueIndex("uq_external_identities_provider_user", providerId, providerUserId)
    }
}

class ExternalIdentityEntity(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<ExternalIdentityEntity>(ExternalIdentities)

    var profile by ProfileEntity referencedOn ExternalIdentities.profileId
    var provider by ProviderEntity referencedOn ExternalIdentities.providerId
    var providerUserId by ExternalIdentities.providerUserId
    var createdAt by ExternalIdentities.createdAt
    var updatedAt by ExternalIdentities.updatedAt
    var deletedAt by ExternalIdentities.deletedAt
}
