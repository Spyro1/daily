from __future__ import annotations

import datetime
import uuid
from decimal import Decimal
from typing import Any, Optional

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Profiles(Base):
    __tablename__ = "profiles"
    __table_args__ = (
        Index("ix_profiles_updated_at", "updated_at"),
        Index("ix_profiles_deleted_at", "deleted_at"),
        Index(
            "ux_profiles_email_active",
            "email",
            unique=True,
            postgresql_where=text("email IS NOT NULL AND deleted_at IS NULL"),
        ),
        CheckConstraint("length(trim(display_name)) > 0", name="ck_profiles_display_name_not_empty"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    accounts: Mapped[list[Accounts]] = relationship(back_populates="profile")
    categories: Mapped[list[Categories]] = relationship(back_populates="profile")
    external_identities: Mapped[list[ExternalIdentities]] = relationship(back_populates="profile")
    transactions: Mapped[list[Transactions]] = relationship(back_populates="profile")
    notification_logs: Mapped[list[NotificationLogs]] = relationship(back_populates="profile")

# Static table of the connected SSO login providers
class Providers(Base):
    __tablename__ = "providers"
    __table_args__ = (
        Index("ix_providers_deleted_at", "deleted_at"),
        Index(
            "ux_providers_code_active",
            "code",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
        CheckConstraint("length(trim(name)) > 0", name="ck_providers_name_not_empty"),
        CheckConstraint("code ~ '^[a-z0-9_\\-]+$'", name="ck_providers_code_slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    external_identities: Mapped[list[ExternalIdentities]] = relationship(back_populates="provider")


class ExternalIdentities(Base):
    __tablename__ = "external_identities"
    __table_args__ = (
        Index(
            "ux_external_identities_provider_user_active",
            "provider_id",
            "provider_user_id",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
        Index("ix_external_identities_profile_deleted", "profile_id", "deleted_at"),
        Index("ix_external_identities_provider_deleted", "provider_id", "deleted_at"),
        CheckConstraint("length(trim(provider_user_id)) > 0", name="ck_external_identities_provider_user_not_empty"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("providers.id", ondelete="RESTRICT"), nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    profile: Mapped[Profiles] = relationship(back_populates="external_identities")
    provider: Mapped[Providers] = relationship(back_populates="external_identities")


class Icons(Base):
    __tablename__ = "icons"
    __table_args__ = (
        Index("ix_icons_system_deleted", "is_system", "deleted_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    svg_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    accounts: Mapped[list[Accounts]] = relationship(back_populates="icon")
    categories: Mapped[list[Categories]] = relationship(back_populates="icon")


class Accounts(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        Index("ix_accounts_profile_archived_deleted", "profile_id", "is_archived", "deleted_at"),
        Index("ix_accounts_profile_include_total_deleted", "profile_id", "include_in_total", "deleted_at"),
        Index(
            "ux_accounts_profile_name_active",
            "profile_id",
            "name",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
        CheckConstraint("currency_code ~ '^[A-Z]{3}$'", name="ck_accounts_currency_iso4217"),
        CheckConstraint("color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'", name="ck_accounts_color_hex"),
        CheckConstraint("length(trim(name)) > 0", name="ck_accounts_name_not_empty"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    currency_code: Mapped[str] = mapped_column(String(3), nullable=False)
    icon_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("icons.id", ondelete="SET NULL"), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)
    include_in_total: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    is_archived: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    profile: Mapped[Profiles] = relationship(back_populates="accounts")
    icon: Mapped[Optional[Icons]] = relationship(back_populates="accounts")
    source_transactions: Mapped[list[Transactions]] = relationship(
        back_populates="source_account",
        foreign_keys="Transactions.source_account_id",
    )
    destination_transactions: Mapped[list[Transactions]] = relationship(
        back_populates="destination_account",
        foreign_keys="Transactions.destination_account_id",
    )


class Categories(Base):
    __tablename__ = "categories"
    __table_args__ = (
        Index("ix_categories_profile_parent_deleted", "profile_id", "parent_id", "deleted_at"),
        Index("ix_categories_profile_type_deleted", "profile_id", "category_type", "deleted_at"),
        Index(
            "ux_categories_profile_parent_name_type_active",
            "profile_id",
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

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category_type: Mapped[str] = mapped_column(String(20), nullable=False)
    is_system_category: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    icon_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("icons.id", ondelete="SET NULL"), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    profile: Mapped[Profiles] = relationship(back_populates="categories")
    icon: Mapped[Optional[Icons]] = relationship(back_populates="categories")
    parent: Mapped[Optional[Categories]] = relationship(remote_side=[id], back_populates="children")
    children: Mapped[list[Categories]] = relationship(back_populates="parent")
    transactions: Mapped[list[Transactions]] = relationship(back_populates="category")


class Transactions(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        Index("ix_transactions_profile_occurred_deleted", "profile_id", "occurred_at", "deleted_at"),
        Index("ix_transactions_source_occurred", "source_account_id", "occurred_at"),
        Index("ix_transactions_destination_occurred", "destination_account_id", "occurred_at"),
        Index("ix_transactions_profile_type_occurred_deleted", "profile_id", "transaction_type", "occurred_at", "deleted_at"),
        Index("ix_transactions_profile_category_occurred", "profile_id", "category_id", "occurred_at"),
        Index("ix_transactions_profile_updated_at", "profile_id", "updated_at"),
        CheckConstraint("transaction_type IN ('income', 'expense', 'transfer', 'overwrite')", name="ck_transactions_type"),
        CheckConstraint("amount > 0", name="ck_transactions_amount_positive"),
        CheckConstraint("target_amount IS NULL OR target_amount > 0", name="ck_transactions_target_amount_positive"),
        CheckConstraint(
            "(transaction_type = 'transfer' AND destination_account_id IS NOT NULL AND category_id IS NULL "
            "AND destination_account_id <> source_account_id AND target_amount IS NOT NULL) OR "
            "(transaction_type IN ('income', 'expense') AND destination_account_id IS NULL AND category_id IS NOT NULL "
            "AND target_amount IS NULL) OR "
            "(transaction_type = 'overwrite' AND destination_account_id IS NULL AND category_id IS NULL "
            "AND target_amount IS NULL)",
            name="ck_transactions_type_integrity",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    source_account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=False)
    destination_account_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    transaction_type: Mapped[str] = mapped_column(String(20), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    target_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 4), nullable=True)
    occurred_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    profile: Mapped[Profiles] = relationship(back_populates="transactions")
    source_account: Mapped[Accounts] = relationship(back_populates="source_transactions", foreign_keys=[source_account_id])
    destination_account: Mapped[Optional[Accounts]] = relationship(back_populates="destination_transactions", foreign_keys=[destination_account_id])
    category: Mapped[Optional[Categories]] = relationship(back_populates="transactions")
    notification_logs: Mapped[list[NotificationLogs]] = relationship(back_populates="processed_transaction")


class NotificationLogs(Base):
    __tablename__ = "notification_logs"
    __table_args__ = (
        Index("ix_notification_logs_profile_status_created", "profile_id", "status", "created_at"),
        Index("ix_notification_logs_profile_created", "profile_id", "created_at"),
        Index("ix_notification_logs_processed_transaction", "processed_transaction_id"),
        Index("ix_notification_logs_ai_feedback_json_gin", "ai_feedback_json", postgresql_using="gin"),
        CheckConstraint("status IN ('pending', 'processed', 'failed')", name="ck_notification_logs_status"),
        CheckConstraint("length(trim(raw_text)) > 0", name="ck_notification_logs_raw_text_not_empty"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    processed_transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    source_app_package: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="pending")
    ai_feedback_json: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    profile: Mapped[Profiles] = relationship(back_populates="notification_logs")
    processed_transaction: Mapped[Optional[Transactions]] = relationship(back_populates="notification_logs")