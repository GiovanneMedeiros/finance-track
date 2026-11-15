import {
  connectionStatus,
  constantTimeEqual,
  findOrCreateConnection,
  getAdminClient,
  getItem,
  handleOptions,
  jsonResponse,
  safeErrorMessage,
  syncConnection,
  syncCreatedTransactionsLink,
} from '../_shared/pluggy.ts'

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void }

type WebhookPayload = {
  id?: string
  eventId?: string
  event?: string
  clientId?: string
  itemId?: string
  item?: { id?: string }
  transactionIds?: string[]
  createdTransactionsLink?: string
  createdTransactionsLinkV2?: string
  data?: {
    id?: string
    itemId?: string
    item?: { id?: string }
    transactionIds?: string[]
  }
}

async function stableEventId(payload: WebhookPayload) {
  const suppliedId = payload.eventId ?? payload.id
  if (typeof suppliedId === 'string' && suppliedId) return suppliedId.slice(0, 250)
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function payloadItemId(payload: WebhookPayload) {
  return payload.itemId ?? payload.item?.id ?? payload.data?.itemId ?? payload.data?.item?.id ?? payload.data?.id
}

async function processEvent(eventRowId: string, payload: WebhookPayload) {
  const admin = getAdminClient()
  try {
    const eventName = payload.event ?? ''
    if (!eventName.startsWith('item/') && !eventName.startsWith('transactions/')) {
      const { error } = await admin
        .from('open_finance_webhook_events')
        .update({ status: 'processed', processed_at: new Date().toISOString(), error_message: null })
        .eq('id', eventRowId)
      if (error) throw new Error(`Could not record ignored webhook event: ${error.message}`)
      return
    }

    const itemId = payloadItemId(payload)
    if (!itemId || !/^[\w-]{1,128}$/.test(itemId)) {
      throw new Error('Webhook event did not contain a valid item ID.')
    }

    if (eventName === 'item/deleted') {
      const { error } = await admin
        .from('open_finance_connections')
        .delete()
        .eq('provider', 'pluggy')
        .eq('provider_connection_id', itemId)
      if (error) throw new Error(`Could not remove the deleted item: ${error.message}`)
    } else if (eventName === 'transactions/deleted') {
      const transactionIds = (payload.transactionIds ?? payload.data?.transactionIds ?? [])
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
        .slice(0, 500)
      if (!transactionIds.length) throw new Error('Deleted transaction event did not contain transaction IDs.')
      const { data: connection, error: lookupError } = await admin
        .from('open_finance_connections')
        .select('id')
        .eq('provider', 'pluggy')
        .eq('provider_connection_id', itemId)
        .maybeSingle()
      if (lookupError) throw new Error(`Could not resolve transaction connection: ${lookupError.message}`)
      if (!connection) throw new Error('No FinanceTrack connection was found for the deleted transactions.')
      const { error } = await admin
        .from('open_finance_transactions')
        .update({
          status: 'DELETED',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('connection_id', connection.id)
        .in('external_transaction_id', transactionIds)
      if (error) throw new Error(`Could not mark deleted transactions: ${error.message}`)
    } else {
      const item = await getItem(itemId)
      if (typeof item.clientUserId !== 'string' || !item.clientUserId) {
        throw new Error('Pluggy did not return an owner for the item.')
      }
      const connection = await findOrCreateConnection(item.clientUserId, item)
      if (connectionStatus(item) === 'connected') {
        const transactionsLink = eventName === 'transactions/created'
          ? payload.createdTransactionsLinkV2 ?? payload.createdTransactionsLink
          : null
        if (transactionsLink) {
          await syncCreatedTransactionsLink(item.clientUserId, connection, transactionsLink)
        } else {
          await syncConnection(item.clientUserId, connection, item)
        }
      } else {
        const { error } = await admin
          .from('open_finance_connections')
          .update({
            status: connectionStatus(item),
            last_error: connectionStatus(item) === 'error'
              ? 'A instituição informou um erro na conexão.'
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', connection.id)
        if (error) throw new Error(`Could not update the item status: ${error.message}`)
      }
    }

    const { error } = await admin
      .from('open_finance_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString(), error_message: null })
      .eq('id', eventRowId)
    if (error) throw new Error(`Could not record webhook completion: ${error.message}`)
  } catch (error) {
    await admin
      .from('open_finance_webhook_events')
      .update({
        status: 'error',
        error_message: 'Webhook processing failed. Use manual synchronization to reconcile this connection.',
      })
      .eq('id', eventRowId)
    console.error('Pluggy webhook processing failed:', safeErrorMessage(error))
  }
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Method not allowed.' }, 405)

  const configuredSecret = Deno.env.get('PLUGGY_WEBHOOK_SECRET')
  const receivedSecret = request.headers.get('x-ft-webhook-secret') ?? ''
  if (!configuredSecret || !constantTimeEqual(receivedSecret, configuredSecret)) {
    return jsonResponse(request, { error: 'Unauthorized.' }, 401)
  }

  try {
    const payload = await request.json() as WebhookPayload
    const expectedClientId = Deno.env.get('PLUGGY_CLIENT_ID')
    if (!expectedClientId || payload.clientId !== expectedClientId) {
      return jsonResponse(request, { error: 'Unknown Pluggy application.' }, 401)
    }
    if (typeof payload.event !== 'string' || !payload.event) {
      return jsonResponse(request, { error: 'Invalid webhook event.' }, 400)
    }

    const admin = getAdminClient()
    const { data: event, error: insertError } = await admin
      .from('open_finance_webhook_events')
      .upsert({
        provider: 'pluggy',
        provider_event_id: await stableEventId(payload),
        status: 'processing',
        received_at: new Date().toISOString(),
        payload: {
          event: payload.event,
          itemId: payloadItemId(payload) ?? null,
          clientId: payload.clientId,
        },
      }, { onConflict: 'provider,provider_event_id', ignoreDuplicates: true })
      .select('id')
      .maybeSingle()
    if (insertError) throw new Error(`Could not register webhook event: ${insertError.message}`)
    if (!event) return jsonResponse(request, { received: true, duplicate: true })

    EdgeRuntime.waitUntil(processEvent(event.id, payload))
    return jsonResponse(request, { received: true }, 202)
  } catch (error) {
    console.error('Pluggy webhook request failed:', safeErrorMessage(error))
    return jsonResponse(request, { error: 'Webhook could not be accepted.' }, 500)
  }
})
