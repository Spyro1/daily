```mermaid
erDiagram
    users ||--o{ accounts : "owns"
    users ||--o{ categories : "defines"
    users ||--o{ transactions : "records"
    users ||--o{ provided_users : "has"

    providers ||--o{ provided_users : "auth_provider"

    categories ||--o{ categories : "parent_of"
    categories ||--o{ transactions : "categorizes"

    accounts ||--o{ transactions : "source"
    accounts ||--o{ transactions : "destination_transfer"

    users {
        uuid id PK
        string email "nullable"
        string display_name
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    providers {
        uuid id PK
        string name
        boolean is_enabled
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    provided_users {
        uuid id PK
        uuid user_id FK
        uuid provider_id FK
        string provider_user_id
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    accounts {
        uuid id PK
        uuid user_id FK
        string name
        string currency_code "ISO-4217"
        string icon_name "default: Savings"
        string color "HEX nullable"
        boolean include_in_total
        boolean is_archived
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    categories {
        uuid id PK
        uuid user_id FK
        uuid parent_id FK "self nullable"
        string name
        string category_type "expense|income"
        boolean is_system_category
        string icon_name "default: Savings"
        string color "HEX nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    transactions {
        uuid id PK
        uuid user_id FK
        uuid source_account_id FK "nullable; income esetén NULL"
        uuid destination_account_id FK "nullable; transfer esetén kötelező"
        uuid category_id FK "nullable transfernél"
        string transaction_type "income|expense|transfer"
        decimal amount "numeric(18,4)"
        decimal target_amount "numeric(18,4) nullable"
        datetime occurred_at
        string note "nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }
```