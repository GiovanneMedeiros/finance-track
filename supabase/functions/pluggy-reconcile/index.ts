import {
  getAdminClient,
  handleOptions,
  jsonResponse,
  requireUser,
  safeErrorMessage,
  syncConnection,
  getItem,
  constantTimeEqual,
  connectionStatus,
} from '../_shared/pluggy.ts'

const STALE_SYNC_MINUTES = 15
const MAX_CONNECTIONS_PER_RUN = 50

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse

  const scheduledSecret = Deno.env.get('PLUGGY_RECONCILE_SECRET') ?? ''
  const receivedSecret = request.headers.get('x-ft-reconcile-secret') ?? ''
  const { user, error: authError } = await requireUser(request)
  const scheduledRequest = Boolean(scheduledSecret && constantTimeEqual(receivedSecret, scheduledSecret))
  if (!scheduledRequest && (authError || !user)) {
    return jsonResponse(request, { error: 'Authentication required.' }, 401)
  }
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Method not allowed.' }, 405)

  const admin = getAdminClient()
  const staleBefore = new Date(Date.now() - STALE_SYNC_MINUTES * 60 * 1000).toISOString()
  let query = admin
    .from('open_finance_connections')
    .select('id, user_id, provider_connection_id, institution_name, status')
    .eq('provider', 'pluggy')
    .order('last_synced_at', { ascending: true, nullsFirst: true })
    .limit(MAX_CONNECTIONS_PER_RUN)

  if (scheduledRequest) {
    query = query.or(`status.eq.connected,and(status.eq.syncing,sync_started_at.lt.${staleBefore})`)
  } else {
    query = query.eq('user_id', user!.id)
  }

  const { data: connections, error: lookupError } = await query
  if (lookupError) {
    console.error('Pluggy reconciliation lookup failed:', lookupError.message)
    return jsonResponse(request, { error: 'Could not load connections for reconciliation.' }, 500)
  }

  const results = []
  for (const connection of connections ?? []) {
    try {
      const item = await getItem(String(connection.provider_connection_id))
      if (item.clientUserId !== connection.user_id) {
        throw new Error('Pluggy item ownership could not be verified.')
      }
      if (item.status === 'UPDATED' || item.status === 'OUTDATED') {
        const result = await syncConnection(connection.user_id, connection, item)
        results.push({ ...result, status: 'connected' })
      } else {
        const status = connectionStatus(item)
        const { error } = await admin.from('open_finance_connections').update({
          status,
          last_error: status === 'error'
            ? 'A instituição informou um erro na conexão. Reautorize a instituição e tente novamente.'
            : null,
          updated_at: new Date().toISOString(),
        }).eq('id', connection.id).eq('user_id', connection.user_id)
        if (error) throw new Error(`Could not update connection status: ${error.message}`)
        results.push({ connectionId: connection.id, status })
      }
    } catch (error) {
      console.error('Pluggy reconciliation failed:', safeErrorMessage(error))
      await admin.from('open_finance_connections').update({
        status: 'error',
        last_error: 'A reconciliação falhou. Tente sincronizar novamente.',
        updated_at: new Date().toISOString(),
      }).eq('id', connection.id).eq('user_id', connection.user_id)
      results.push({ connectionId: connection.id, status: 'error' })
    }
  }

  return jsonResponse(request, { processed: results.length, results })
})
