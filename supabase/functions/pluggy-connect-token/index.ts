import {
  handleOptions,
  jsonResponse,
  pluggyJson,
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
    const result = await pluggyJson<{ accessToken?: string }>('/connect_token', {
      method: 'POST',
      body: JSON.stringify({
        options: {
          clientUserId: user.id,
          avoidDuplicates: true,
        },
      }),
    })
    if (!result.accessToken) throw new Error('Pluggy did not return a Connect token.')

    return jsonResponse(request, {
      connectToken: result.accessToken,
      includeSandbox: Deno.env.get('PLUGGY_INCLUDE_SANDBOX') === 'true',
    })
  } catch (error) {
    console.error('Pluggy Connect token creation failed:', safeErrorMessage(error))
    return jsonResponse(request, { error: 'Não foi possível iniciar a conexão com a instituição financeira.' }, 502)
  }
})
