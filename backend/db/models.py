from __future__ import annotations

import datetime
import uuid
from decimal import Decimal
from typing import Any, Optional

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, Text, case, func, text, select
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, column_property, mapped_column, relationship


class Base(DeclarativeBase):
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class Users(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_updated_at", "updated_at"),
        Index("ix_users_deleted_at", "deleted_at"),
        Index(
            "ux_users_email_active",
            "email",
            unique=True,
            postgresql_where=text("email IS NOT NULL AND deleted_at IS NULL"),
        ),
        CheckConstraint("length(trim(display_name)) > 0", name="ck_users_display_name_not_empty"),
    )

    # Fields
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Connections
    accounts: Mapped[list[Accounts]] = relationship(back_populates="user")
    categories: Mapped[list[Categories]] = relationship(back_populates="user")
    provided_users: Mapped[list[ProvidedUsers]] = relationship(back_populates="user")
    transactions: Mapped[list[Transactions]] = relationship(back_populates="user")
    # notification_logs: Mapped[list[NotificationLogs]] = relationship(back_populates="user")

# Static table of the connected SSO login providers
class Providers(Base):
    __tablename__ = "providers"
    __table_args__ = (
        Index("ix_providers_deleted_at", "deleted_at"),
        Index(
            "ux_providers_name_active",
            "name",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
        CheckConstraint("length(trim(name)) > 0", name="ck_providers_name_not_empty"),
    )

    # Fields
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")

    # Connection
    provided_users: Mapped[list[ProvidedUsers]] = relationship(back_populates="provider")


class ProvidedUsers(Base):
    __tablename__ = "provided_users"
    __table_args__ = (
        Index(
            "ux_provided_users_provider_user_active",
            "provider_id",
            "provider_user_id",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
        Index("ix_provided_users_user_deleted", "user_id", "deleted_at"),
        Index("ix_provided_users_provider_deleted", "provider_id", "deleted_at"),
        CheckConstraint("length(trim(provider_user_id)) > 0", name="ck_provided_users_provider_user_not_empty"),
    )

    # Fields
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("providers.id", ondelete="RESTRICT"), nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Connections
    user: Mapped[Users] = relationship(back_populates="provided_users")
    provider: Mapped[Providers] = relationship(back_populates="provided_users")


# class Icons(Base):
#     __tablename__ = "icons"
#     __table_args__ = (
#         Index("ix_icons_system_deleted", "is_system", "deleted_at"),
#     )

#     id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     name: Mapped[str] = mapped_column(String(255), nullable=False)
#     svg_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
#     is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
#     created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
#     updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
#     deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

#     accounts: Mapped[list[Accounts]] = relationship(back_populates="icon")
#     categories: Mapped[list[Categories]] = relationship(back_populates="icon")

class Categories(Base):
    __tablename__ = "categories"
    __table_args__ = (
        Index("ix_categories_user_parent_deleted", "user_id", "parent_id", "deleted_at"),
        Index("ix_categories_user_type_deleted", "user_id", "category_type", "deleted_at"),
        Index(
            "ux_categories_user_parent_name_type_active",
            "user_id",
            "parent_id",
            "name",
            "category_type",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
        CheckConstraint("category_type IN ('expense', 'income')", name="ck_categories_category_type"),
        CheckConstraint("parent_id IS NULL OR parent_id <> id", name="ck_categories_parent_not_self"),
        CheckConstraint("color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'", name="ck_categories_color_hex"),
        CheckConstraint("length(trim(name)) > 0", name="ck_categories_name_not_empty"),
    )

    # Fields
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category_type: Mapped[str] = mapped_column(String(20), nullable=False) # "expense" vagy "income"
    is_system_category: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    icon_name: Mapped[str] = mapped_column(String(100), server_default="Savings", nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)
    
    # Connections
    user: Mapped[Users] = relationship(back_populates="categories")
    # icon: Mapped[Optional[Icons]] = relationship(back_populates="categories")
    parent: Mapped[Optional[Categories]] = relationship(remote_side=[id], back_populates="children")
    children: Mapped[list[Categories]] = relationship(back_populates="parent")
    transactions: Mapped[list[Transactions]] = relationship(back_populates="category")


class Transactions(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        Index("ix_transactions_user_occurred_deleted", "user_id", "occurred_at", "deleted_at"),
        Index("ix_transactions_source_occurred", "source_account_id", "occurred_at"),
        Index("ix_transactions_destination_occurred", "destination_account_id", "occurred_at"),
        Index("ix_transactions_user_type_occurred_deleted", "user_id", "transaction_type", "occurred_at", "deleted_at"),
        
        CheckConstraint("transaction_type IN ('income', 'expense', 'transfer', 'overwrite')", name="ck_transactions_type"),
        CheckConstraint("amount > 0", name="ck_transactions_amount_positive"),
        
        # Új, szigorított integritási szabályok
        CheckConstraint(
            # 1. INCOME: Csak cél számla van, kategória kötelező
            "(transaction_type = 'income' AND destination_account_id IS NOT NULL AND source_account_id IS NULL AND category_id IS NOT NULL) OR "
            
            # 2. EXPENSE: Csak forrás számla van, kategória kötelező
            "(transaction_type = 'expense' AND source_account_id IS NOT NULL AND destination_account_id IS NULL AND category_id IS NOT NULL) OR "
            
            # 3. TRANSFER: Mindkét számla megadva, kategória tilos, cél összeg kötelező (deviza miatt)
            "(transaction_type = 'transfer' AND source_account_id IS NOT NULL AND destination_account_id IS NOT NULL "
            "AND source_account_id <> destination_account_id AND category_id IS NULL AND target_amount IS NOT NULL)",
            
            # 4. OVERWRITE: Csak forrás számla (vagy cél, de maradjunk a forrásnál), kategória tilos, összeg lehet negatív is? 
            # (Az overwrite-nál az 'amount' a különbözet lesz: pl. -200 vagy +500)
            # "(transaction_type = 'overwrite' AND source_account_id IS NOT NULL AND destination_account_id IS NULL AND category_id IS NULL)",
            
            name="ck_transactions_type_integrity",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source_account_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=True)
    destination_account_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    transaction_type: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Az 'amount' mindig a forrás szempontjából vett levonás, vagy a bevétel értéke
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    # Csak devizás átutalásnál lehet eltérő a cél összeg, ekkor a 'amount' a forrás számla terhelése, a 'target_amount' pedig a cél számla jóváírása lesz
    target_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 4), nullable=True)
    
    occurred_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Connections
    user: Mapped[Users] = relationship(back_populates="transactions")
    source_account: Mapped[Accounts] = relationship(back_populates="source_transactions", foreign_keys=[source_account_id])
    destination_account: Mapped[Optional[Accounts]] = relationship(back_populates="destination_transactions", foreign_keys=[destination_account_id])
    category: Mapped[Optional[Categories]] = relationship(back_populates="transactions")
    # notification_logs: Mapped[list[NotificationLogs]] = relationship(back_populates="processed_transaction")


class Accounts(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        Index("ix_accounts_user_archived_deleted", "user_id", "is_archived", "deleted_at"),
        Index("ix_accounts_user_include_total_deleted", "user_id", "include_in_total", "deleted_at"),
        Index(
            "ux_accounts_user_name_active",
            "user_id",
            "name",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
        CheckConstraint("currency_code ~ '^[A-Z]{3}$'", name="ck_accounts_currency_iso4217"),
        CheckConstraint("color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'", name="ck_accounts_color_hex"),
        CheckConstraint("length(trim(name)) > 0", name="ck_accounts_name_not_empty"),
    )

    # Fields
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    currency_code: Mapped[str] = mapped_column(String(3), nullable=False)
    icon_name: Mapped[str] = mapped_column(String(100), server_default="Savings", nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)
    include_in_total: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    is_archived: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    
    # Connections
    user: Mapped[Users] = relationship(back_populates="accounts")
    # icon: Mapped[Optional[Icons]] = relationship(back_populates="accounts")
    source_transactions: Mapped[list[Transactions]] = relationship(
        back_populates="source_account",
        foreign_keys="Transactions.source_account_id",
    )
    destination_transactions: Mapped[list[Transactions]] = relationship(
        back_populates="destination_account",
        foreign_keys="Transactions.destination_account_id",
    )

    # A balance property definiálása
    balance: Mapped[Decimal] = column_property(
        select(
            func.coalesce(
                func.sum(
                    case(
                        # Bevétel vagy Bejövő utalás
                        (Transactions.destination_account_id == id, Transactions.target_amount),
                        # Kiadás vagy Kimenő utalás vagy Overwrite korrekció
                        (Transactions.source_account_id == id, -Transactions.amount),
                        else_=0
                    )
                ),
                0
            )
        )
        .where(
            ((Transactions.source_account_id == id) | (Transactions.destination_account_id == id)),
            Transactions.deleted_at.is_(None)
        )
        .correlate_except(Transactions)
        .scalar_subquery()
    )




# Future feature
# class NotificationLogs(Base):
#     __tablename__ = "notification_logs"
#     __table_args__ = (
#         Index("ix_notification_logs_user_status_created", "user_id", "status", "created_at"),
#         Index("ix_notification_logs_user_created", "user_id", "created_at"),
#         Index("ix_notification_logs_processed_transaction", "processed_transaction_id"),
#         Index("ix_notification_logs_ai_feedback_json_gin", "ai_feedback_json", postgresql_using="gin"),
#         CheckConstraint("status IN ('pending', 'processed', 'failed')", name="ck_notification_logs_status"),
#         CheckConstraint("length(trim(raw_text)) > 0", name="ck_notification_logs_raw_text_not_empty"),
#     )

#     # Fields
#     id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
#     processed_transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
#     raw_text: Mapped[str] = mapped_column(Text, nullable=False)
#     source_app_package: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
#     status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="pending")
#     ai_feedback_json: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
#     # Connections
#     user: Mapped[Users] = relationship(back_populates="notification_logs")
#     processed_transaction: Mapped[Optional[Transactions]] = relationship(back_populates="notification_logs")