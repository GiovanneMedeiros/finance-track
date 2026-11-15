import {
  findOrCreateConnection,
  getAdminClient,
  getItem,
  handleOptions,
  jsonResponse,
  requireUser,
  safeErrorMessage,
  syncConnection,
  connectionStatus,
} from '../_shared/pluggy.ts'

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Method not allowed.' }, 405)

  const { user, error: authError } = await requireUser(request)
  if (authError || !user) return jsonResponse(request, { error: authError }, 401)

  try {
    const payload = await request.json() as { itemId?: string; connectionId?: string }
    let connection
    let item

    if (payload.itemId) {
      item = await getItem(payload.itemId)
      if (item.clientUserId !== user.id) {
        return jsonResponse(request, { error: 'A conexão não pertence a este usuário.' }, 403)
      }
      connection = await findOrCreateConnection(user.id, item)
    } else if (payload.connectionId) {
      const { data, error } = await getAdminClient()
        .from('open_finance_connections')
        .select('id, user_id, provider_connection_id, institution_name, status')
        .eq('id', payload.connectionId)
        .eq('user_id', user.id)
        .eq('provider', 'pluggy')
        .maybeSingle()
      if (error) throw new Error(`Could not load the connection: ${error.message}`)
      if (!data) return jsonResponse(request, { error: 'Conexão não encontrada.' }, 404)
      connection = data
      item = await getItem(String(data.provider_connection_id))
      if (item.clientUserId !== user.id) {
        return jsonResponse(request, { error: 'A conexão não pertence a este usuário.' }, 403)
      }
    } else {
      return jsonResponse(request, { error: 'Informe a conexão a sincronizar.' }, 400)
    }

    if (connectionStatus(item) !== 'connected') {
      const admin = getAdminClient()
      const { error } = await admin.from('open_finance_connections').update({
        status: connectionStatus(item),
        last_error: connectionStatus(item) === 'error'
          ? 'A instituição informou um erro na conexão. Reautorize a instituição e tente novamente.'
          : null,
        updated_at: new Date().toISOString(),
      }).eq('id', connection.id).eq('user_id', user.id)
      if (error) throw new Error(`Could not update the connection status: ${error.message}`)
      return jsonResponse(request, {
        connectionId: connection.id,
        status: connectionStatus(item),
        importedAccounts: 0,
        importedTransactions: 0,
        billSnapshots: 0,
      })
    }

    const result = await syncConnection(user.id, connection, item)
    return jsonResponse(request, { ...result, status: 'connected' })
  } catch (error) {
    console.error('Pluggy synchronization failed:', safeErrorMessage(error))
    return jsonResponse(request, {
      error: 'Não foi possível atualizar os dados da instituição. Tente novamente.',
    }, 502)
  }
})
