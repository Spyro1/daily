# Daily költségvetéskezelő – DB séma (v1.1)

## DB séma

```mermaid
erDiagram
    profiles ||--o{ accounts : "owns"
    profiles ||--o{ categories : "defines"
    profiles ||--o{ transactions : "records"
    profiles ||--o{ external_identities : "has"
    profiles ||--o{ notification_logs : "receives"

    external_identities ||--o{ providers : "auth_provider"

    icons ||--o{ accounts : "decorates"
    icons ||--o{ categories : "decorates"

    categories ||--o{ transactions : "categorizes"
    categories ||--o{ categories : "parent_of"

    accounts ||--o{ transactions : "source"
    accounts ||--o{ transactions : "destination_transfer"
    transactions ||--o{ notification_logs : "created_from"

    profiles {
        uuid id PK
        string email "nullable"
        string display_name
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    providers {
        uuid id PK
        string code "google|authsch|... UNIQUE"
        string name
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    external_identities {
        uuid id PK
        uuid profile_id FK
        uuid provider_id FK
        string provider_user_id
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    icons {
        uuid id PK
        string name
        string svg_content "nullable"
        boolean is_system
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    accounts {
        uuid id PK
        uuid profile_id FK
        string name
        string currency_code "ISO-4217"
        uuid icon_id FK "nullable"
        string color "HEX nullable"
        boolean include_in_total
        boolean is_archived
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    categories {
        uuid id PK
        uuid profile_id FK
        uuid parent_id FK "self nullable"
        string name
        string category_type "expense|income"
        boolean is_system_category
        uuid icon_id FK "nullable"
        string color "HEX nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    transactions {
        uuid id PK
        uuid profile_id FK
        uuid source_account_id FK
        uuid destination_account_id FK "nullable; transfer esetén kötelező"
        uuid category_id FK "nullable transfernél"
        uuid transfer_group_id "nullable; transfer párosításhoz"
        string transaction_type "income|expense|transfer|overwrite"
        decimal amount
        decimal target_amount "nullable"
        datetime occurred_at
        string note "nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }

    notification_logs {
        uuid id PK
        uuid profile_id FK
        uuid processed_transaction_id FK "nullable"
        string raw_text
        string source_app_package "nullable"
        string status "pending|processed|failed"
        string ai_feedback_json "nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "nullable"
    }
```

## Szabályok

### Offline-first és szinkron
- Minden entitásban kötelező: `id`, `created_at`, `updated_at`, `deleted_at`.
- Konfliktus feloldás: azonos `id` esetén a nagyobb `updated_at` nyer.
- Soft delete: rekord törlése `deleted_at` beállítással történik.

### Összegkezelés
- Minden pénzösszeg 2 tizedes pontossággal tárolódik.
- `amount` mindig a forrásszámla devizájában értendő.
- `target_amount` csak eltérő devizás átutaláskor kötelező.

### Tranzakciós integritás (CHECK constraint ajánlás)
- `transaction_type = 'expense'`: `destination_account_id IS NULL`, `category_id IS NOT NULL`.
- `transaction_type = 'income'`: `destination_account_id IS NULL`, `category_id IS NOT NULL`.
- `transaction_type = 'transfer'`: `destination_account_id IS NOT NULL`, `category_id IS NULL`.
- `transaction_type = 'overwrite'`: automatikusan generált kezdőegyenleg tranzakció.

### Számla és kategória szabályok
- `accounts.currency_code` ISO-4217 kód (pl. `HUF`, `EUR`).
- `accounts.is_archived = true` esetén új tranzakció ne jöhessen létre rá.
- Kategóriafa: `parent_id` nem mutathat önmagára vagy saját leszármazottra.
- Törlés előtt a tranzakcióval rendelkező kategória átmozgatandó a rendszer `Other` kategóriába.

### Auth modell
- `external_identities` egyértelmű kapcsolat a lokális profil és provider-fiók között.
- Javasolt egyediség: `UNIQUE(provider_id, provider_user_id)`.

### Notification parser támogatás
- Nem biztosan feldolgozható értesítés: `notification_logs.status = 'pending'`.
- Sikeres feldolgozás esetén kapcsolás: `processed_transaction_id`.
- Felhasználói javítás/tanítás tárolása: `ai_feedback_json`.

## Indexek

- `profiles(updated_at)`
- `accounts(profile_id, is_archived, deleted_at)`
- `categories(profile_id, parent_id, deleted_at)`
- `transactions(profile_id, occurred_at, deleted_at)`
- `transactions(source_account_id, occurred_at)`
- `transactions(destination_account_id, occurred_at)`
- `external_identities(provider_id, provider_user_id)` UNIQUE
- `notification_logs(profile_id, status, created_at)`