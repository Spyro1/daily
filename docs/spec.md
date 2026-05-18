# Daily Budget Manager - Detailed Functional Specification v1.1

Author: Marton Szenes (KTZRDZ)

Date: 2026-02-22

---

## 1. Data Model and Core Principles

The system follows an offline-first architecture. Every record has a client-generated UUID, an updated_at timestamp, and a deleted_at timestamp for synchronization. Monetary amounts are stored in fixed-point format (up to 4 decimal places) to avoid rounding errors.

---

## 2. Profile and Authentication Use Cases (PC)

| ID | Name | Description / Business Logic |
| --- | --- | --- |
| PC-01 | Local profile creation | On first launch, an encrypted local database is created. No internet is required. |
| PC-02 | Google Auth linking | The app retrieves an OIDC token. After a successful response, the local user (user_id) is linked to the Google subject identifier (sub). |
| PC-03 | Data synchronization | During linking, local records missing from cloud storage are uploaded. If a conflict occurs (same UUID), the record with the newer updated_at wins. |
| PC-04 | Logout | User session is terminated. |

---

## 3. Account Management Use Cases (AC)

| ID | Name | Description / Business Logic |
| --- | --- | --- |
| AC-01 | Create account | Required: name, currency (ISO 4217), opening balance. The opening balance generates an automatic transaction. Optional: icon, color, include-in-total flag. |
| AC-02 | Edit account | Name, icon, and include-in-total flag are editable. Currency can only be changed if no transactions are assigned to the account yet. |
| AC-03 | Archive account | Instead of physical deletion, account is archived. It is hidden from selectors, but remains in history and statistics. |
| AC-04 | Balance calculation | Balance is dynamic. It is not stored as a static value and is calculated from linked transactions on each read. |

---

## 4. Category Management Use Cases (CC)

| ID | Name | Description / Business Logic |
| --- | --- | --- |
| CC-01 | Create category | Creates a new category in the hierarchy. Optional parent_id can be provided. |
| CC-02 | Move category | Parent category can be changed. Tree integrity must be validated (a category cannot be its own parent or a descendant of itself). |
| CC-03 | Delete category | If transactions are assigned, the system enforces reassignment under the Other system category before delete/archive flow is completed. |

---

## 5. Transaction Management Use Cases (TR)

| ID | Name | Description / Business Logic |
| --- | --- | --- |
| TR-01 | Record expense/income | Required: amount, expense or income type, date (defaults to current date if omitted), source account, category. Optional: note. After save, account balance updates immediately in UI. |
| TR-02 | Internal transfer | Required: source account and destination account. If currencies differ, source amount and converted destination amount must both be provided. |
| TR-03 | Edit transaction | Any field can be edited. If account or amount changes, affected account balances are recalculated. |
| TR-04 | Delete transaction | Delete is logical (archive): data remains in database, deleted_at is set, and transaction is excluded from active balance calculations. |

---

## 6. Automatic Processing (Notification Parser)

### 6.1 Notification Processing Flow

1. Trigger: The system listens to notifications from configured banking apps.
2. Parsing: AI-based text parsing attempts to extract amount, date, and if possible, related accounts and categories.
3. Matching: If accounts/categories are identified, the transaction is created automatically. Otherwise an unprocessed notification record is created for manual processing. Corrected records are used to improve parser behavior.
4. Queueing: If there is no internet, raw notification text is saved into a local queue and processed later when connectivity is restored.

---

## 7. Import / Export (IE)

| ID | Name | Description / Business Logic |
| --- | --- | --- |
| IE-01 | Export | Export full database content (accounts, categories, transactions) to JSON or flat CSV format. |
| IE-02 | Import | Import from CSV or JSON files. |

Schema validation:
- Records with missing required fields are rejected.

Deduplication:
- If record identifiers match existing records, records are treated as duplicates and skipped.

---

## 8. Error Paths and Exception Handling

- Conflict handling: If the same record is edited on two devices, the version with the higher updated_at value is kept.
- Parsing failure: If amount cannot be extracted from a notification, the parser creates an unprocessed notification record that can be fixed manually.
