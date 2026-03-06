package spyro1.daily.database.tables

import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import java.util.UUID

object NotificationLogs : UUIDTable("notification_logs") {
    val profileId = reference("profile_id", Profiles)
    val processedTransactionId = optReference("processed_transaction_id", Transactions)
    val rawText = text("raw_text")
    val sourceAppPackage = varchar("source_app_package", 255).nullable()
    val status = varchar("status", 20).default("pending") // "pending" | "processed" | "failed"
    val aiFeedbackJson = text("ai_feedback_json").nullable()
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp)
    val updatedAt = timestamp("updated_at").defaultExpression(CurrentTimestamp)
    val deletedAt = timestamp("deleted_at").nullable()

    init {
        index(false, profileId, status, createdAt)
    }
}

class NotificationLogEntity(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<NotificationLogEntity>(NotificationLogs)

    var profile by ProfileEntity referencedOn NotificationLogs.profileId
    var processedTransaction by TransactionEntity optionalReferencedOn NotificationLogs.processedTransactionId
    var rawText by NotificationLogs.rawText
    var sourceAppPackage by NotificationLogs.sourceAppPackage
    var status by NotificationLogs.status
    var aiFeedbackJson by NotificationLogs.aiFeedbackJson
    var createdAt by NotificationLogs.createdAt
    var updatedAt by NotificationLogs.updatedAt
    var deletedAt by NotificationLogs.deletedAt
}
