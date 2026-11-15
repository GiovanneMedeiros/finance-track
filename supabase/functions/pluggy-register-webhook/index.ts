import {
  constantTimeEqual,
  handleOptions,
  jsonResponse,
  pluggyJson,
  safeErrorMessage,
} from '../_shared/pluggy.ts'

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Method not allowed.' }, 405)

  const setupSecret = Deno.env.get('PLUGGY_WEBHOOK_SETUP_SECRET') ?? ''
  const receivedSecret = request.headers.get('x-ft-webhook-setup-secret') ?? ''
  if (!setupSecret || !constantTimeEqual(receivedSecret, setupSecret)) {
    return jsonResponse(request, { error: 'Unauthorized.' }, 401)
  }
  if (Deno.env.get('PLUGGY_WEBHOOK_ID')) {
    return jsonResponse(request, { error: 'A Pluggy webhook is already registered for this deployment.' }, 409)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const webhookSecret = Deno.env.get('PLUGGY_WEBHOOK_SECRET')
    if (!supabaseUrl || !webhookSecret) {
      throw new Error('Supabase URL or webhook verification secret is not configured.')
    }
    const webhookUrl = new URL('/functions/v1/pluggy-webhook', supabaseUrl).toString()
    const result = await pluggyJson<{ id?: string }>('/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        url: webhookUrl,
        event: 'all',
        headers: { 'X-FT-Webhook-Secret': webhookSecret },
      }),
    })
    if (!result.id) throw new Error('Pluggy did not return the webhook ID.')
    return jsonResponse(request, {
      registered: true,
      webhookId: result.id,
      instruction: 'Save the returned ID as PLUGGY_WEBHOOK_ID in Supabase Function secrets.',
    }, 201)
  } catch (error) {
    console.error('Pluggy webhook registration failed:', safeErrorMessage(error))
    return jsonResponse(request, { error: 'Could not register the Pluggy webhook.' }, 502)
  }
})
