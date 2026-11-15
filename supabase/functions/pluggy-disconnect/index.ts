import {
  getAdminClient,
  handleOptions,
  jsonResponse,
  pluggyRequest,
  requireUser,
  safeErrorMessage,
} from '../_shared/pluggy.ts'

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Method not allowed.' }, 405)

  const { user, error: authError } = await requireUser(request)
  if (authError || !user) return jsonResponse(request, { error: authError }, 401)

  try {
    const payload = await request.json() as { connectionId?: string }
    if (!payload.connectionId) return jsonResponse(request, { error: 'Informe a conexão a remover.' }, 400)

    const admin = getAdminClient()
    const { data: connection, error: lookupError } = await admin
      .from('open_finance_connections')
      .select('id, provider_connection_id')
      .eq('id', payload.connectionId)
      .eq('user_id', user.id)
      .eq('provider', 'pluggy')
      .maybeSingle()
    if (lookupError) throw new Error(`Could not load the connection: ${lookupError.message}`)
    if (!connection) return jsonResponse(request, { error: 'Conexão não encontrada.' }, 404)

    await pluggyRequest(`/items/${encodeURIComponent(connection.provider_connection_id)}`, {
      method: 'DELETE',
    })
    const { error: deleteError } = await admin
      .from('open_finance_connections')
      .delete()
      .eq('id', connection.id)
      .eq('user_id', user.id)
    if (deleteError) throw new Error(`Could not remove the connection: ${deleteError.message}`)

    return jsonResponse(request, { disconnected: true })
  } catch (error) {
    console.error('Pluggy disconnection failed:', safeErrorMessage(error))
    return jsonResponse(request, {
      error: 'Não foi possível revogar a conexão. Os dados importados foram preservados.',
    }, 502)
  }
})
