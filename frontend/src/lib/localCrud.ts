import { localDb } from '@/lib/localDb'
import type { LocalAccount, LocalCategory, LocalTransaction } from '@/lib/localDb'

function nowIso() {
  return new Date().toISOString()
}

function genId() {
  return crypto.randomUUID()
}

export async function getLocalAccounts(): Promise<LocalAccount[]> {
  return localDb.accounts.toArray()
}

export async function getLocalAccount(id: string): Promise<LocalAccount | undefined> {
  return localDb.accounts.get(id)
}

export async function createLocalAccount(input: {
  name: string
  balance?: number
  currency_code: string
  icon_name?: string
  color?: string | null
  include_in_total?: boolean
}): Promise<LocalAccount> {
  const record: LocalAccount = {
    id: genId(),
    name: input.name,
    balance: input.balance ?? 0,
    currency_code: input.currency_code,
    icon_name: input.icon_name ?? 'AccountBalanceWallet',
    color: input.color ?? null,
    include_in_total: input.include_in_total ?? true,
    is_archived: false,
    created_at: nowIso(),
  }
  await localDb.accounts.put(record)
  return record
}

export async function updateLocalAccount(
  id: string,
  patch: Partial<Omit<LocalAccount, 'id' | 'created_at'>>,
): Promise<LocalAccount> {
  const existing = await localDb.accounts.get(id)
  if (!existing) throw new Error(`Local account not found: ${id}`)

  const next: LocalAccount = { ...existing, ...patch }
  await localDb.accounts.put(next)
  return next
}

export async function deleteLocalAccount(id: string): Promise<void> {
  await localDb.accounts.delete(id)
}

export async function getLocalCategories(): Promise<LocalCategory[]> {
  return localDb.categories.toArray()
}

export async function createLocalCategory(input: {
  name: string
  parent_id?: string | null
  icon_name?: string
  color?: string | null
  type: 'expense' | 'income'
}): Promise<LocalCategory> {
  const record: LocalCategory = {
    id: genId(),
    name: input.name,
    parent_id: input.parent_id ?? null,
    icon_name: input.icon_name ?? 'Category',
    color: input.color ?? null,
    category_type: input.type,
    created_at: nowIso(),
  }
  await localDb.categories.put(record)
  return record
}

export async function updateLocalCategory(
  id: string,
  patch: {
    name?: string
    parent_id?: string | null
    icon_name?: string
    color?: string | null
    type?: 'expense' | 'income'
  },
): Promise<LocalCategory> {
  const existing = await localDb.categories.get(id)
  if (!existing) throw new Error(`Local category not found: ${id}`)

  const next: LocalCategory = {
    ...existing,
    ...(patch.name != null && { name: patch.name }),
    ...(patch.parent_id !== undefined && { parent_id: patch.parent_id }),
    ...(patch.icon_name != null && { icon_name: patch.icon_name }),
    ...(patch.color !== undefined && { color: patch.color }),
    ...(patch.type != null && { category_type: patch.type }),
  }
  await localDb.categories.put(next)
  return next
}

export async function deleteLocalCategory(id: string): Promise<void> {
  await localDb.categories.delete(id)
}

export async function getLocalTransactions(): Promise<LocalTransaction[]> {
  const txns = await localDb.transactions.toArray()
  return txns.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
}

export async function createLocalTransaction(input: {
  source_account_id?: string | null
  destination_account_id?: string | null
  category_id?: string | null
  transaction_type: 'expense' | 'income' | 'transfer'
  amount: number
  target_amount?: number | null
  occurred_at?: string
  note?: string | null
}): Promise<LocalTransaction> {
  const record: LocalTransaction = {
    id: genId(),
    source_account_id: input.source_account_id ?? null,
    destination_account_id: input.destination_account_id ?? null,
    category_id: input.category_id ?? null,
    transaction_type: input.transaction_type,
    amount: input.amount,
    target_amount: input.target_amount ?? null,
    occurred_at: input.occurred_at ?? nowIso(),
    note: input.note ?? null,
    created_at: nowIso(),
  }
  await localDb.transactions.put(record)
  return record
}

export async function updateLocalTransaction(
  id: string,
  patch: Partial<Omit<LocalTransaction, 'id' | 'created_at'>>,
): Promise<LocalTransaction> {
  const existing = await localDb.transactions.get(id)
  if (!existing) throw new Error(`Local transaction not found: ${id}`)

  const next: LocalTransaction = { ...existing, ...patch }
  await localDb.transactions.put(next)
  return next
}

export async function deleteLocalTransaction(id: string): Promise<void> {
  await localDb.transactions.delete(id)
}
