import * as React from 'react'
import { render } from '@react-email/components'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'VERATIS'
const SENDER_DOMAIN = 'notify.veratisbio.com'
const FROM_ADDRESS = 'support@veratisbio.com'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Server-side helper to render a registered template and enqueue it to the
 * transactional email queue. Use from server functions / server routes where
 * the caller is trusted (no JWT). Honors the suppression list.
 */
export async function enqueueTransactionalEmail(params: {
  templateName: string
  recipientEmail: string
  templateData?: Record<string, any>
  idempotencyKey?: string
}): Promise<{ success: boolean; reason?: string }> {
  const { templateName, recipientEmail, templateData = {} } = params
  const template = TEMPLATES[templateName]
  if (!template) throw new Error(`Unknown email template: ${templateName}`)

  const effectiveRecipient = (template.to || recipientEmail).toLowerCase()
  if (!effectiveRecipient) throw new Error('recipientEmail is required')

  const messageId = crypto.randomUUID()
  const idempotencyKey = params.idempotencyKey || messageId

  // Suppression check
  const { data: suppressed } = await supabaseAdmin
    .from('suppressed_emails')
    .select('id')
    .eq('email', effectiveRecipient)
    .maybeSingle()
  if (suppressed) {
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'suppressed',
    })
    return { success: false, reason: 'email_suppressed' }
  }

  // Unsubscribe token (one per email, reuse if exists)
  let unsubscribeToken: string
  const { data: existing } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', effectiveRecipient)
    .maybeSingle()
  if (existing && !existing.used_at) {
    unsubscribeToken = existing.token
  } else if (!existing) {
    unsubscribeToken = generateToken()
    await supabaseAdmin
      .from('email_unsubscribe_tokens')
      .upsert(
        { token: unsubscribeToken, email: effectiveRecipient },
        { onConflict: 'email', ignoreDuplicates: true },
      )
    const { data: stored } = await supabaseAdmin
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', effectiveRecipient)
      .maybeSingle()
    if (stored?.token) unsubscribeToken = stored.token
  } else {
    return { success: false, reason: 'email_suppressed' }
  }

  // Render
  const element = React.createElement(template.component, templateData)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  await supabaseAdmin.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabaseAdmin.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <${FROM_ADDRESS}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: enqueueError.message,
    })
    throw new Error(`Failed to enqueue email: ${enqueueError.message}`)
  }

  return { success: true }
}