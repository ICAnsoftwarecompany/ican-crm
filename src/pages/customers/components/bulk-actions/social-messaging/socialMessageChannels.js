import { Mail, MessageCircle, MessagesSquare } from 'lucide-react'

export const SOCIAL_MESSAGE_CHANNELS = [
  {
    id: 'messenger',
    label: 'ماسنجر',
    accent: '#0A7CFF',
    icon: MessageCircle,
  },
  {
    id: 'whatsapp',
    label: 'واتس اب',
    accent: '#128C7E',
    icon: MessagesSquare,
  },
  {
    id: 'tiktok',
    label: 'تيك توك',
    accent: '#111827',
    icon: null,
    shortLabel: 'TT',
  },
  {
    id: 'snapchat',
    label: 'سناب شات',
    accent: '#F7D000',
    icon: null,
    shortLabel: 'SC',
  },
  {
    id: 'mail',
    label: 'Mail',
    accent: '#EA4335',
    icon: Mail,
  },
  {
    id: 'sms',
    label: 'SMS',
    accent: '#2563EB',
    icon: MessageCircle,
  },
]
