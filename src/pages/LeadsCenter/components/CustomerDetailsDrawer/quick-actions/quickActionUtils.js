import i18n from 'i18next'
import { toast } from 'sonner'

export function getCustomerPhone(customer) {
  return customer?.phone || customer?.lead?.phone || ''
}

export function getCustomerEmail(customer) {
  return customer?.email || customer?.lead?.email || ''
}

export function normalizePhoneForUrl(phone) {
  return String(phone || '').replace(/[^\d+]/g, '')
}

export function openExternalAction(url, missingMessage) {
  if (!url) {
    toast.info(missingMessage)
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

export function notifySoon(label) {
  toast.info(label, {
    description: i18n.t('customers.quickActions.comingSoonDescription'),
    duration: 2800,
  })
}
