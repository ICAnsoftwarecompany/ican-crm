const DEFAULT_NOTIFICATION_TITLE = 'إشعار جديد'

function toText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return ''
  return String(value).trim()
}

function toDateValue(value) {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function firstText(...values) {
  return values.map(toText).find(Boolean) || ''
}

function getNestedData(payload = {}) {
  return payload.data && typeof payload.data === 'object' ? payload.data : {}
}

export function detectNotificationChannel(payload = {}) {
  const data = getNestedData(payload)
  const haystack = [
    payload.channel,
    payload.type,
    payload.event,
    payload.action,
    data.channel,
    data.type,
    data.source,
    data.icon,
    payload.conversation?.channel,
  ].filter(Boolean).join(' ').toLowerCase()

  if (payload.mailbox_email || payload.gmail_message_id || payload.from_address || haystack.includes('gmail')) return 'gmail'
  if (
    payload.phone_number_id ||
    payload.whatsapp_message_id ||
    payload.wa_id ||
    data.phone_number_id ||
    data.whatsapp_message_id ||
    data.wa_id ||
    haystack.includes('whatsapp') ||
    haystack.includes('واتساب')
  ) return 'whatsapp'
  if (payload.message_id || payload.conversation_id || payload.conversation || haystack.includes('messenger')) return 'messenger'
  if (haystack.includes('task')) return 'tasks'
  if (haystack.includes('lead')) return 'leads'
  return 'system'
}

export function getNotificationTitle(payload = {}) {
  const data = getNestedData(payload)
  const channel = detectNotificationChannel(payload)

  if (channel === 'gmail') {
    return firstText(
      payload.subject,
      data.subject,
      payload.title,
      data.title,
      payload.from_name ? `رسالة Gmail من ${payload.from_name}` : '',
      payload.from_address ? `رسالة Gmail من ${payload.from_address}` : '',
      'رسالة Gmail جديدة'
    )
  }

  if (channel === 'messenger') {
    const contactName = firstText(
      payload.contact?.name,
      payload.customer?.name,
      data.lead_name,
      data.customer_name
    )
    return firstText(
      payload.title,
      data.title,
      contactName ? `رسالة ماسنجر من ${contactName}` : '',
      'رسالة ماسنجر جديدة'
    )
  }

  if (channel === 'whatsapp') {
    const contactName = firstText(
      payload.contact?.name,
      payload.customer?.name,
      payload.contact?.phone,
      data.customer_name,
      data.phone
    )
    return firstText(
      payload.title,
      data.title,
      contactName ? `\u0631\u0633\u0627\u0644\u0629 WhatsApp \u0645\u0646 ${contactName}` : '',
      '\u0631\u0633\u0627\u0644\u0629 WhatsApp \u062c\u062f\u064a\u062f\u0629'
    )
  }

  return firstText(
    payload.title,
    payload.notification?.title,
    data.title,
    payload.message,
    DEFAULT_NOTIFICATION_TITLE
  )
}

export function getNotificationDescription(payload = {}) {
  const data = getNestedData(payload)
  const channel = detectNotificationChannel(payload)

  if (channel === 'gmail') {
    return firstText(
      payload.snippet,
      data.snippet,
      payload.body,
      data.body,
      payload.from_address,
      payload.mailbox_email
    )
  }

  if (channel === 'messenger') {
    const message = payload.message || data.message || {}
    return firstText(
      message.body,
      message.text,
      payload.body,
      payload.description,
      data.body,
      data.description,
      data.source
    )
  }

  if (channel === 'whatsapp') {
    const message = payload.message || data.message || {}
    return firstText(
      message.body,
      message.text,
      message.message,
      payload.body,
      payload.description,
      data.body,
      data.description,
      payload.contact?.phone,
      data.phone
    )
  }

  return firstText(
    payload.body,
    payload.description,
    payload.notification?.body,
    payload.notification?.description,
    data.body,
    data.description,
    data.lead_name,
    data.source,
    payload.type
  )
}

export function getNotificationActionUrl(payload = {}) {
  const data = getNestedData(payload)
  const channel = detectNotificationChannel(payload)

  if (channel === 'gmail') {
    const conversationId = payload.conversation_id || payload.conversation?.id || data.conversation_id
    return conversationId ? `/conversations?channel=gmail&gmailConversation=${encodeURIComponent(conversationId)}` : ''
  }

  if (channel === 'messenger') {
    const conversationId = payload.conversation_id || payload.conversation?.id || data.conversation_id || data.conversation?.id
    return conversationId ? `/conversations?conversation=${encodeURIComponent(conversationId)}` : ''
  }

  if (channel === 'whatsapp') {
    const conversationId = payload.conversation_id || payload.conversation?.id || data.conversation_id || data.conversation?.id
    return conversationId ? `/conversations?channel=whatsapp&whatsappConversation=${encodeURIComponent(conversationId)}` : ''
  }

  return firstText(payload.action_url, payload.notification?.action_url, data.action_url)
}

export function buildNotificationId(payload = {}, options = {}) {
  const channel = options.channel || detectNotificationChannel(payload)
  const data = getNestedData(payload)
  return firstText(
    options.id,
    payload.id && `${channel}:${payload.id}`,
    payload.notification?.id && `${channel}:${payload.notification.id}`,
    data.id && `${channel}:${data.id}`,
    payload.message?.id && `${channel}:message:${payload.message.id}`,
    payload.gmail_message_id && `${channel}:message:${payload.gmail_message_id}`,
    payload.message_id && `${channel}:message:${payload.message_id}`,
    `${channel}:${Date.now()}:${Math.random().toString(36).slice(2)}`
  )
}

export function buildNotificationFromPayload(payload = {}, options = {}) {
  const channel = options.channel || detectNotificationChannel(payload)
  const data = getNestedData(payload)

  return {
    id: buildNotificationId(payload, { ...options, channel }),
    channel,
    type: firstText(options.type, payload.type, data.type, payload.action, data.action, channel),
    title: firstText(options.title, getNotificationTitle(payload)),
    description: firstText(options.description, getNotificationDescription(payload)),
    actionUrl: firstText(options.actionUrl, getNotificationActionUrl(payload)),
    createdAt: toDateValue(options.createdAt || payload.created_at || data.created_at || payload.received_at || payload.sent_at),
    read: Boolean(options.read),
    persistent: options.persistent !== false,
    temporary: Boolean(options.temporary),
    severity: firstText(options.severity, payload.severity, data.severity, channel === 'gmail' ? 'danger' : 'info'),
    payload,
  }
}

export function buildGmailMessageNotification(payload = {}, options = {}) {
  return buildNotificationFromPayload(payload, {
    ...options,
    channel: 'gmail',
    type: 'gmail.message.received',
    title: firstText(payload.subject, `رسالة Gmail من ${firstText(payload.from_name, payload.from_address, 'مرسل جديد')}`),
    description: firstText(payload.snippet, payload.body, payload.from_address),
    actionUrl: options.actionUrl,
    createdAt: payload.received_at || payload.created_at,
    persistent: true,
  })
}

export function buildWhatsappMessageNotification(payload = {}, options = {}) {
  const message = payload.message || payload
  const contactName = firstText(
    payload.contact?.name,
    payload.customer?.name,
    payload.contact?.phone,
    payload.phone,
    message.from,
    message.from_id
  )

  return buildNotificationFromPayload(payload, {
    ...options,
    channel: 'whatsapp',
    type: 'whatsapp.message.received',
    title: firstText(options.title, contactName ? `\u0631\u0633\u0627\u0644\u0629 WhatsApp \u0645\u0646 ${contactName}` : '\u0631\u0633\u0627\u0644\u0629 WhatsApp \u062c\u062f\u064a\u062f\u0629'),
    description: firstText(message.body, message.text, message.message, message.caption, payload.body),
    actionUrl: options.actionUrl,
    createdAt: message.sent_at || message.created_at || payload.created_at,
    persistent: true,
  })
}
