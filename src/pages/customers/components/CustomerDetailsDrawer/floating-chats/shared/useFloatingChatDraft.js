import { useEffect, useMemo, useState } from 'react'

function buildInitialMessages(channelLabel, customer) {
  return [
    {
      id: `${channelLabel}-ready`,
      text: `نافذة ${channelLabel} جاهزة للربط مع ${customer?.name || 'العميل'}.`,
      direction: 'incoming',
      status: 'read',
      createdAt: new Date().toISOString(),
    },
  ]
}

export function useFloatingChatDraft(channel, channelLabel, customer, open) {
  const [messages, setMessages] = useState([])
  const [isSending, setIsSending] = useState(false)
  const customerId = customer?.id || customer?.lead_id || 'unknown'

  useEffect(() => {
    if (!open) return
    setMessages(buildInitialMessages(channelLabel, customer))
  }, [channel, channelLabel, customerId, open])

  const sendMessage = async ({ text }) => {
    const id = `${channel}-${Date.now()}`
    setIsSending(true)
    setMessages((current) => [
      ...current,
      {
        id,
        text,
        direction: 'outgoing',
        status: 'sending',
        createdAt: new Date().toISOString(),
      },
    ])

    await new Promise((resolve) => {
      window.setTimeout(resolve, 450)
    })

    setMessages((current) => current.map((message) => (
      message.id === id ? { ...message, status: 'sent' } : message
    )))
    setIsSending(false)
  }

  return useMemo(() => ({
    messages,
    isSending,
    sendMessage,
  }), [isSending, messages])
}
