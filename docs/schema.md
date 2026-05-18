# Database Schema

Last updated: 2026-05-04

## ER Diagram

```mermaid
erDiagram
    providers ||--o{ provided_users : "maps"
    users ||--o{ provided_users : "has"

    users ||--o{ accounts : "owns"
    users ||--o{ categories : "owns"
    users ||--o{ transactions : "owns"

    accounts ||--o{ transactions : "source"
    accounts ||--o{ transactions : "destination"
    

    categories ||--o{ categories : "parent_child"
    categories ||--o{ transactions : "categorizes"

    providers {
        UUID id PK
        string name
        bool is_enabled "indicates if the provider is active"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable for soft delete"
    }

    provided_users {
        UUID id PK
        UUID user_id FK
        UUID provider_id FK
        string provider_user_id
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable for soft delete"
    }

    users {
        UUID id PK
        string email
        string display_name
        string avatar_url "set by auth provider"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable for soft delete"
    }


    accounts {
        UUID id PK
        UUID user_id FK
        string name
        string currency_code
        string icon_name
        string color
        bool include_in_total
        bool is_archived
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable for soft delete"
    }

    categories {
        UUID id PK
        UUID user_id FK
        UUID parent_id FK
        string name
        string category_type
        bool is_system_category
        string icon_name
        string color
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable for soft delete"
    }

    transactions {
        UUID id PK
        UUID user_id FK
        UUID source_account_id FK
        UUID destination_account_id FK
        UUID category_id FK
        string transaction_type
        decimal amount
        decimal target_amount
        datetime occurred_at
        string note
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable for soft delete"
    }
```

## Rules

Core rules implemented in DB constraints and model definitions:
- soft delete on core entities (`deleted_at`)
- transaction type integrity rules
- positive amount check
- ISO-4217-like currency code check
- HEX color check

## Transaction Integrity

- income: destination account required, source null, category required
- expense: source account required, destination null, category required
- transfer: source and destination required and different, category null, target_amount required

## Notes

- `accounts.balance` is computed from transaction rows, not stored as a static value
- `transaction_type` DB check includes `overwrite`, but app logic currently uses expense/income/transfer (for future feature)
