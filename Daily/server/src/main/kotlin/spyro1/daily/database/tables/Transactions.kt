package spyro1.daily.database.tables

import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.or
import org.jetbrains.exposed.sql.kotlin.datetime.datetime
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import java.util.UUID

object Transactions : UUIDTable("transactions") {
    val profileId = reference("profile_id", Profiles)
    val sourceAccountId = reference("source_account_id", Accounts)
    val destinationAccountId = optReference("destination_account_id", Accounts) // required for transfers
    val categoryId = optReference("category_id", Categories) // null for transfers
    val transferGroupId = uuid("transfer_group_id").nullable() // links transfer pairs, not a FK
    val transactionType = varchar("transaction_type", 20) // "income" | "expense" | "transfer" | "overwrite"
    val amount = decimal("amount", 19, 4)
    val targetAmount = decimal("target_amount", 19, 4).nullable() // only for cross-currency transfers
    val occurredAt = datetime("occurred_at")
    val note = text("note").nullable()
    val createdAt = timestamp("created_at").defaultExpression(CurrentTimestamp)
    val updatedAt = timestamp("updated_at").defaultExpression(CurrentTimestamp)
    val deletedAt = timestamp("deleted_at").nullable()

    init {
        index(false, profileId, occurredAt, deletedAt)
        index(false, sourceAccountId, occurredAt)
        index(false, destinationAccountId, occurredAt)

        // CHECK: expense → destination_account_id IS NULL, category_id IS NOT NULL
        check("ck_transactions_expense") {
            (transactionType neq "expense") or
                (destinationAccountId.isNull() and categoryId.isNotNull())
        }

        // CHECK: income → destination_account_id IS NULL, category_id IS NOT NULL
        check("ck_transactions_income") {
            (transactionType neq "income") or
                (destinationAccountId.isNull() and categoryId.isNotNull())
        }

        // CHECK: transfer → destination_account_id IS NOT NULL, category_id IS NULL
        check("ck_transactions_transfer") {
            (transactionType neq "transfer") or
                (destinationAccountId.isNotNull() and categoryId.isNull())
        }
    }
}

class TransactionEntity(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<TransactionEntity>(Transactions)

    var profile by ProfileEntity referencedOn Transactions.profileId
    var sourceAccount by AccountEntity referencedOn Transactions.sourceAccountId
    var destinationAccount by AccountEntity optionalReferencedOn Transactions.destinationAccountId
    var category by CategoryEntity optionalReferencedOn Transactions.categoryId
    var transferGroupId by Transactions.transferGroupId
    var transactionType by Transactions.transactionType
    var amount by Transactions.amount
    var targetAmount by Transactions.targetAmount
    var occurredAt by Transactions.occurredAt
    var note by Transactions.note
    var createdAt by Transactions.createdAt
    var updatedAt by Transactions.updatedAt
    var deletedAt by Transactions.deletedAt
}
