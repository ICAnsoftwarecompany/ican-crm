import i18n from 'i18next'
import { Mail, MessageCircle, MessagesSquare } from 'lucide-react'

export const SOCIAL_MESSAGE_CHANNELS = [
  {
    id: 'messenger',
    get label() {
      return i18n.t('customers.socialMessaging.channels.messenger')
    },
    accent: '#0A7CFF',
    icon: MessageCircle,
  },
  {
    id: 'whatsapp',
    get label() {
      return i18n.t('customers.socialMessaging.channels.whatsapp')
    },
    accent: '#128C7E',
    icon: MessagesSquare,
  },
  {
    id: 'tiktok',
    get label() {
      return i18n.t('customers.socialMessaging.channels.tiktok')
    },
    accent: '#111827',
    icon: null,
    shortLabel: 'TT',
  },
  {
    id: 'snapchat',
    get label() {
      return i18n.t('customers.socialMessaging.channels.snapchat')
    },
    accent: '#F7D000',
    icon: null,
    shortLabel: 'SC',
  },
  {
    id: 'mail',
    get label() {
      return i18n.t('customers.socialMessaging.channels.mail')
    },
    accent: '#EA4335',
    icon: Mail,
  },
  {
    id: 'sms',
    get label() {
      return i18n.t('customers.socialMessaging.channels.sms')
    },
    accent: '#2563EB',
    icon: MessageCircle,
  },
]
