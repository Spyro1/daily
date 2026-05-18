import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface LocalUserProfile {
  key: 'local'
  display_name: string
  email: string
  created_at: string
}

export interface LocalAccount {
  id: string
  name: string
  balance: number
  currency_code: string
  icon_name: string
  color: string | null
  include_in_total: boolean
  is_archived: boolean
  created_at: string
}

export interface LocalCategory {
  id: string
  parent_id: string | null
  name: string
  category_type: 'expense' | 'income'
  icon_name: string
  color: string | null
  created_at: string
}

export interface LocalTransaction {
  id: string
  source_account_id: string | null
  destination_account_id: string | null
  category_id: string | null
  transaction_type: 'expense' | 'income' | 'transfer'
  amount: number
  target_amount: number | null
  occurred_at: string
  note: string | null
  created_at: string
}

class LocalDb extends Dexie {
  accounts!: Table<LocalAccount, string>
  categories!: Table<LocalCategory, string>
  transactions!: Table<LocalTransaction, string>
  profile!: Table<LocalUserProfile, 'local'>

  constructor() {
    super('daily')
    this.version(1).stores({
      accounts: 'id, name, currency_code, created_at',
      categories: 'id, parent_id, category_type, created_at',
      transactions: 'id, occurred_at, transaction_type, source_account_id, destination_account_id, category_id, created_at',
      profile: 'key',
    })
  }
}

export const localDb = new LocalDb()
