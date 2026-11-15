import { createClient } from 'npm:@supabase/supabase-js@2'

const API_URL = 'https://api.pluggy.ai'
const MAX_ACCOUNT_PAGES = 100
const MAX_TRANSACTION_PAGES = 1000
const SYNC_BATCH_SIZE = 200

type JsonRecord = Record<string, unknown>

type PluggyItem = JsonRecord & {
  id: string
  clientUserId?: string | null
  status?: string
  executionStatus?: string
  connector?: { name?: string } | null
  error?: { message?: string; code?: string } | null
  consentExpiresAt?: string | null
}

type CreditAccount = JsonRecord & {
  id: string
  itemId: string
  type: string
  subtype?: string
  name: string
  marketingName?: string | null
  number?: string | null
  balance?: number | null
  currencyCode?: string | null
  creditData?: {
    brand?: string | null
    status?: string | null
    creditLimit?: number | null
    availableCreditLimit?: number | null
    balanceDueDate?: string | null
    balanceCloseDate?: string | null
  } | null
}

type PluggyTransaction = JsonRecord & {
  id: string
  accountId: string
  description: string
  amount: number
  currencyCode: string
  category?: string | null
  date: string
  status: string
  type?: string | null
  updatedAt?: string | null
  creditCardMetadata?: JsonRecord | null
}

const corsHeaders = (request: Request) => {
  const origin = request.headers.get('origin') ?? ''
  const configuredOrigin = Deno.env.get('FINANCETRACK_APP_ORIGIN')?.replace(/\/$/, '')
  const allowedOrigins = new Set([
    configuredOrigin,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean))

  return {
    'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type, x-ft-webhook-secret, x-ft-webhook-setup-secret, x-ft-reconcile-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'null',
    'Vary': 'Origin',
  }
}

export function jsonResponse(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
  })
}

export function handleOptions(request: Request) {
  if (request.method !== 'OPTIONS') return null
  return new Response('ok', { headers: corsHeaders(request) })
}

export function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Supabase Edge Function secrets are not configured.')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function requireUser(request: Request) {
  const authorization = request.headers.get('Authorization')
  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!authorization?.startsWith('Bearer ') || !url || !anonKey) {
    return { user: null, error: 'Authentication required.' }
  }

  const client = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authorization } },
  })
  const { data, error } = await client.auth.getUser()
  return {
    user: error ? null : data.user,
    error: error ? 'Authentication required.' : null,
  }
}

let apiKeyCache: { key: string; refreshAt: number } | null = null
let apiKeyInFlight: Promise<string> | null = null

async function fetchApiKey() {
  const clientId = Deno.env.get('PLUGGY_CLIENT_ID')
  const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET')
  if (!clientId || !clientSecret) {
    throw new Error('Pluggy server credentials are not configured.')
  }

  const response = await fetch(`${API_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  })
  if (!response.ok) {
    throw new Error(`Pluggy authentication failed (${response.status}).`)
  }

  const result = await response.json()
  if (typeof result.apiKey !== 'string' || !result.apiKey) {
    throw new Error('Pluggy did not return an API key.')
  }

  apiKeyCache = {
    key: result.apiKey,
    refreshAt: Date.now() + 110 * 60 * 1000,
  }
  return result.apiKey
}

export async function getApiKey(forceRefresh = false) {
  if (!forceRefresh && apiKeyCache && Date.now() < apiKeyCache.refreshAt) {
    return apiKeyCache.key
  }
  if (!apiKeyInFlight) {
    apiKeyInFlight = fetchApiKey().finally(() => {
      apiKeyInFlight = null
    })
  }
  return apiKeyInFlight
}

export async function pluggyRequest(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const apiKey = await getApiKey()
  const response = await fetch(new URL(path, API_URL), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
      ...init.headers,
    },
  })
  if (response.status === 401 && retry) {
    apiKeyCache = null
    return pluggyRequest(path, init, false)
  }
  if (!response.ok) {
    throw new Error(`Pluggy API request failed (${response.status}).`)
  }
  return response
}

export async function pluggyJson<T>(path: string, init?: RequestInit): Promise<T> {
  return await (await pluggyRequest(path, init)).json() as T
}

export function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function validDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null
  return value.slice(0, 10)
}

function creditCardMetadata(value: unknown): JsonRecord | null {
  if (!value || typeof value !== 'object') return null
  const metadata = value as JsonRecord
  const allowed = ['totalAmount', 'totalInstallments', 'installmentNumber', 'purchaseDate']
  return Object.fromEntries(allowed
    .filter((key) => metadata[key] !== undefined && metadata[key] !== null)
    .map((key) => [key, metadata[key]]))
}

function mapTransaction(
  transaction: PluggyTransaction,
  userId: string,
  connectionId: string,
  accountId: string,
  fallbackCurrency?: string | null,
): JsonRecord | null {
  if (
    !transaction.id
    || !transaction.date
    || !transaction.status
    || typeof transaction.amount !== 'number'
    || !Number.isFinite(transaction.amount)
  ) return null

  return {
    user_id: userId,
    connection_id: connectionId,
    account_id: accountId,
    external_transaction_id: transaction.id,
    description: String(transaction.description ?? 'Transação sem descrição').slice(0, 500),
    amount: transaction.amount,
    currency: transaction.currencyCode || fallbackCurrency || null,
    category: typeof transaction.category === 'string' ? transaction.category.slice(0, 120) : null,
    transaction_date: transaction.date,
    status: transaction.status,
    transaction_type: transaction.type ?? null,
    credit_card_metadata: creditCardMetadata(transaction.creditCardMetadata),
    provider_updated_at: transaction.updatedAt ?? null,
    deleted_at: transaction.status === 'DELETED' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }
}

async function paginatedAccounts(itemId: string): Promise<CreditAccount[]> {
  const accounts: CreditAccount[] = []
  for (let page = 1; page <= MAX_ACCOUNT_PAGES; page += 1) {
    const url = new URL('/accounts', API_URL)
    url.searchParams.set('itemId', itemId)
    url.searchParams.set('page', String(page))
    url.searchParams.set('pageSize', '500')
    const result = await pluggyJson<{ results?: CreditAccount[]; totalPages?: number }>(url.toString())
    accounts.push(...(result.results ?? []))
    if (page >= Number(result.totalPages ?? page)) return accounts
  }
  throw new Error('Pluggy account pagination exceeded the safety limit.')
}

async function paginatedTransactions(accountId: string): Promise<PluggyTransaction[]> {
  const transactions: PluggyTransaction[] = []
  let nextUrl: URL | null = new URL('/v2/transactions', API_URL)
  nextUrl.searchParams.set('accountId', accountId)

  for (let page = 0; nextUrl && page < MAX_TRANSACTION_PAGES; page += 1) {
    const result: { results?: PluggyTransaction[]; next?: string | null } = await pluggyJson<{
      results?: PluggyTransaction[]
      next?: string | null
    }>(nextUrl.toString())
    transactions.push(...(result.results ?? []))
    if (!result.next) return transactions

    const candidate: URL = new URL(result.next, API_URL)
    if (candidate.origin !== API_URL || candidate.pathname !== '/v2/transactions') {
      throw new Error('Pluggy returned an invalid transaction pagination URL.')
    }
    nextUrl = candidate
  }
  if (nextUrl) throw new Error('Pluggy transaction pagination exceeded the safety limit.')
  return transactions
}

export async function syncCreatedTransactionsLink(
  userId: string,
  connection: JsonRecord,
  link: string,
) {
  const firstUrl = new URL(link, API_URL)
  if (firstUrl.origin !== API_URL) {
    throw new Error('Pluggy returned an invalid created-transactions URL.')
  }
  if (firstUrl.pathname === '/transactions') {
    const item = await getItem(String(connection.provider_connection_id))
    return syncConnection(userId, connection, item)
  }
  if (firstUrl.pathname !== '/v2/transactions') {
    throw new Error('Pluggy returned an unsupported created-transactions URL.')
  }

  const pages: PluggyTransaction[] = []
  let nextUrl: URL | null = firstUrl
  for (let page = 0; nextUrl && page < MAX_TRANSACTION_PAGES; page += 1) {
    const result: { results?: PluggyTransaction[]; next?: string | null } =
      await pluggyJson<{ results?: PluggyTransaction[]; next?: string | null }>(nextUrl.toString())
    pages.push(...(result.results ?? []))
    if (!result.next) {
      nextUrl = null
      break
    }
    const candidate: URL = new URL(result.next, API_URL)
    if (candidate.origin !== API_URL || candidate.pathname !== '/v2/transactions') {
      throw new Error('Pluggy returned an invalid transaction pagination URL.')
    }
    nextUrl = candidate
  }
  if (nextUrl) throw new Error('Pluggy transaction pagination exceeded the safety limit.')

  const admin = getAdminClient()
  const connectionId = String(connection.id ?? '')
  if (!connectionId) throw new Error('The saved connection has no database ID.')
  const externalAccountIds = [...new Set(pages.map((transaction) => transaction.accountId).filter(Boolean))]
  if (!externalAccountIds.length) return { importedAccounts: 0, importedTransactions: 0, billSnapshots: 0 }

  const { data: accounts, error: accountError } = await admin
    .from('open_finance_accounts')
    .select('id, external_account_id')
    .eq('connection_id', connectionId)
    .eq('user_id', userId)
    .in('external_account_id', externalAccountIds)
  if (accountError) throw new Error(`Could not resolve created transaction accounts: ${accountError.message}`)
  const accountIds = new Map((accounts ?? []).map((account) => [account.external_account_id, account.id]))
  if (accountIds.size !== externalAccountIds.length) {
    const item = await getItem(String(connection.provider_connection_id))
    return syncConnection(userId, connection, item)
  }

  const rows = pages.flatMap((transaction) => {
    const accountId = accountIds.get(transaction.accountId)
    if (!accountId) return []
    const row = mapTransaction(transaction, userId, connectionId, accountId)
    return row ? [row] : []
  })
  await upsertRows(admin, 'open_finance_transactions', rows, 'connection_id,external_transaction_id')
  const { error: syncError } = await admin
    .from('open_finance_connections')
    .update({
      status: 'connected',
      last_synced_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .eq('user_id', userId)
  if (syncError) throw new Error(`Could not record incremental sync: ${syncError.message}`)
  return { connectionId, importedAccounts: 0, importedTransactions: rows.length, billSnapshots: 0 }
}

function chunks<T>(values: T[], size: number): T[][] {
  const result: T[][] = []
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size))
  }
  return result
}

async function upsertRows(admin: ReturnType<typeof getAdminClient>, table: string, rows: JsonRecord[], conflict: string) {
  for (const batch of chunks(rows, SYNC_BATCH_SIZE)) {
    const { error } = await admin.from(table).upsert(batch, { onConflict: conflict })
    if (error) throw new Error(`Could not persist Pluggy ${table} data: ${error.message}`)
  }
}

export async function findOrCreateConnection(userId: string, item: PluggyItem) {
  if (!item.id || item.clientUserId !== userId) {
    throw new Error('This Pluggy item is not associated with the authenticated FinanceTrack user.')
  }

  const admin = getAdminClient()
  const { data: existing, error: lookupError } = await admin
    .from('open_finance_connections')
    .select('id, user_id, provider_connection_id')
    .eq('provider', 'pluggy')
    .eq('provider_connection_id', item.id)
    .maybeSingle()
  if (lookupError) throw new Error(`Could not verify the Pluggy connection: ${lookupError.message}`)
  if (existing && existing.user_id !== userId) {
    throw new Error('This Pluggy item is already associated with another FinanceTrack user.')
  }

  const status = connectionStatus(item)
  const { data, error } = await admin
    .from('open_finance_connections')
    .upsert({
      user_id: userId,
      provider: 'pluggy',
      provider_connection_id: item.id,
      institution_name: item.connector?.name ?? null,
      status,
      last_error: status === 'error' ? safeItemError(item) : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider,provider_connection_id' })
    .select('id, user_id, provider_connection_id, institution_name, status')
    .single()
  if (error) throw new Error(`Could not save the Pluggy connection: ${error.message}`)
  return data
}

export function connectionStatus(item: PluggyItem) {
  const expiresAt = item.consentExpiresAt ? Date.parse(item.consentExpiresAt) : NaN
  if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) return 'expired'
  if (item.status === 'WAITING_USER_INPUT' || item.status === 'WAITING_USER_ACTION') {
    return 'pending_authorization'
  }
  if (
    item.status === 'LOGIN_ERROR'
    || item.status === 'INVALID_CREDENTIALS'
    || item.status === 'ERROR'
    || item.executionStatus === 'ERROR'
  ) {
    return 'error'
  }
  if (item.status === 'UPDATED' || item.status === 'OUTDATED') return 'connected'
  if (['UPDATING', 'PENDING', 'CREATED', 'RUNNING'].includes(item.status ?? '')) return 'syncing'
  return 'error'
}

function safeItemError(item: PluggyItem) {
  const code = item.error?.code
  return typeof code === 'string' ? `Pluggy reported connection error (${code}).` : 'Pluggy reported a connection error.'
}

export async function getItem(itemId: string) {
  if (!/^[\w-]{1,128}$/.test(itemId)) throw new Error('Invalid Pluggy item ID.')
  return await pluggyJson<PluggyItem>(`/items/${encodeURIComponent(itemId)}`)
}

export async function syncConnection(userId: string, connection: JsonRecord, item?: PluggyItem) {
  const admin = getAdminClient()
  const connectionId = String(connection.id ?? '')
  const itemId = String(connection.provider_connection_id ?? '')
  if (!connectionId || !itemId) throw new Error('The saved connection is missing a database or Pluggy item ID.')

  const latestItem = item ?? await getItem(itemId)
  if (latestItem.id !== itemId || latestItem.clientUserId !== userId) {
    throw new Error('Pluggy item ownership could not be verified.')
  }

  const initialStatus = connectionStatus(latestItem)
  const { error: startError } = await admin
    .from('open_finance_connections')
    .update({ status: 'syncing', sync_started_at: new Date().toISOString(), last_error: null })
    .eq('id', connectionId)
    .eq('user_id', userId)
  if (startError) throw new Error(`Could not start the Pluggy sync: ${startError.message}`)

  try {
    const allAccounts = await paginatedAccounts(itemId)
    const creditAccounts = allAccounts.filter((account) => (
      account.type === 'CREDIT' && account.subtype === 'CREDIT_CARD'
    ))
    const accountRows = creditAccounts.map((account) => {
      const cardNumberDigits = String(account.number ?? '').replace(/\D/g, '')
      return {
        user_id: userId,
        connection_id: connectionId,
        external_account_id: account.id,
        account_type: account.type,
        account_subtype: account.subtype ?? null,
        name: account.name,
        marketing_name: account.marketingName ?? null,
        brand: account.creditData?.brand ?? null,
        last_four_digits: cardNumberDigits.length >= 4 ? cardNumberDigits.slice(-4) : null,
        currency: account.currencyCode ?? null,
        balance: finiteNumber(account.balance),
        credit_limit: finiteNumber(account.creditData?.creditLimit),
        available_limit: finiteNumber(account.creditData?.availableCreditLimit),
        balance_due_date: validDate(account.creditData?.balanceDueDate),
        balance_close_date: validDate(account.creditData?.balanceCloseDate),
        provider_status: account.creditData?.status ?? null,
        is_active: true,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })
    await upsertRows(admin, 'open_finance_accounts', accountRows, 'connection_id,external_account_id')

    const { data: savedAccounts, error: accountLookupError } = await admin
      .from('open_finance_accounts')
      .select('id, external_account_id')
      .eq('connection_id', connectionId)
      .eq('user_id', userId)
      .eq('is_active', true)
    if (accountLookupError) throw new Error(`Could not load saved Pluggy accounts: ${accountLookupError.message}`)
    const accountByExternalId = new Map(
      (savedAccounts ?? []).map((account) => [account.external_account_id, account.id]),
    )

    const transactionRows: JsonRecord[] = []
    for (const account of creditAccounts) {
      const accountId = accountByExternalId.get(account.id)
      if (!accountId) continue
      const providerTransactions = await paginatedTransactions(account.id)
      for (const transaction of providerTransactions) {
        if (transaction.accountId !== account.id) continue
        const row = mapTransaction(transaction, userId, connectionId, accountId, account.currencyCode)
        if (row) transactionRows.push(row)
      }
    }
    await upsertRows(
      admin,
      'open_finance_transactions',
      transactionRows,
      'connection_id,external_transaction_id',
    )

    const billSnapshots = creditAccounts
      .filter((account) => (
        finiteNumber(account.balance) !== null
        || validDate(account.creditData?.balanceDueDate) !== null
        || validDate(account.creditData?.balanceCloseDate) !== null
      ))
      .map((account) => ({
        user_id: userId,
        connection_id: connectionId,
        account_id: accountByExternalId.get(account.id),
        amount: finiteNumber(account.balance),
        currency: account.currencyCode ?? null,
        due_date: validDate(account.creditData?.balanceDueDate),
        closing_date: validDate(account.creditData?.balanceCloseDate),
        source: 'credit_account_balance',
        status: 'current_balance',
        reported_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      .filter((snapshot) => snapshot.account_id)
    await upsertRows(admin, 'open_finance_bill_snapshots', billSnapshots, 'account_id')

    const currentStatus = initialStatus
    const { error: finishError } = await admin
      .from('open_finance_connections')
      .update({
        institution_name: latestItem.connector?.name ?? connection.institution_name ?? null,
        status: currentStatus,
        last_synced_at: new Date().toISOString(),
        last_error: currentStatus === 'error' ? safeItemError(latestItem) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId)
      .eq('user_id', userId)
    if (finishError) throw new Error(`Could not complete the Pluggy sync: ${finishError.message}`)

    return {
      connectionId,
      importedAccounts: accountRows.length,
      importedTransactions: transactionRows.length,
      billSnapshots: billSnapshots.length,
    }
  } catch (error) {
    await admin
      .from('open_finance_connections')
      .update({
        status: 'error',
        last_error: 'A sincronização falhou. Tente novamente; os dados existentes foram preservados.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId)
      .eq('user_id', userId)
    throw error
  }
}

export function safeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Unexpected server error.'
}

export function constantTimeEqual(left: string, right: string) {
  const encoder = new TextEncoder()
  const leftBytes = encoder.encode(left)
  const rightBytes = encoder.encode(right)
  let difference = leftBytes.length ^ rightBytes.length
  const length = Math.max(leftBytes.length, rightBytes.length)
  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0)
  }
  return difference === 0
}
