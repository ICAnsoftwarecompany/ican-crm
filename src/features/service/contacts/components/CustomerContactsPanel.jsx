import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link2, Plus, Star, Users } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useContactsSetup, useCustomerContacts } from '../api/contactsApi'
import { ContactFormDialog } from './ContactFormDialog'

/**
 * People under a customer (guardian → students, company → employees) with
 * their roles and relationships. Relationships also drive portal access (F5).
 */
export function CustomerContactsPanel({ customerId, compact = false }) {
  const { t, i18n } = useTranslation()
  const contacts = useCustomerContacts(customerId)
  const setup = useContactsSetup()
  const [open, setOpen] = useState(false)
  const language = i18n.language
  const list = contacts.data || []
  const relationLabel = (key) => localizeLabel(setup.data?.relation_types?.find((type) => type.key === key)?.label, language, key)

  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <Users size={16} aria-hidden="true" className="text-[var(--text-muted)]" />
          {t('service.contacts.title')}
        </h2>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)} disabled={!customerId}>
          <Plus size={14} aria-hidden="true" />
          {t('service.contacts.add')}
        </Button>
      </div>

      <ResourceState
        isLoading={contacts.isLoading}
        error={contacts.error}
        onRetry={contacts.refetch}
        empty={!list.length}
        emptyIcon={<Users size={20} />}
        emptyTitle={t('service.contacts.emptyTitle')}
        emptyDescription={compact ? undefined : t('service.contacts.emptyDescription')}
      >
        <ul className="grid gap-2">
          {list.map((contact) => (
            <li key={contact.id} className="rounded-md bg-[var(--surface-2)] px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-[var(--text)]">{contact.name}</span>
                {contact.is_primary && (
                  <Star size={12} aria-label={t('service.contacts.primary')} className="text-status-contacted" />
                )}
                {contact.role && (
                  <span className="rounded-full border border-[var(--border)] px-2 text-[11px] text-[var(--text-muted)]">
                    {localizeLabel(contact.role.label, language, contact.role.key)}
                  </span>
                )}
              </div>
              {!compact && (contact.phone || contact.email) && (
                <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-[var(--text-muted)]">
                  {contact.phone && <span dir="ltr">{contact.phone}</span>}
                  {contact.email && <span dir="ltr">{contact.email}</span>}
                </p>
              )}
              {contact.relationships?.filter((relation) => relation.to_contact).map((relation) => (
                <p key={relation.id} className="mt-1 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Link2 size={12} aria-hidden="true" />
                  {t('service.contacts.relation', { relation: relationLabel(relation.relation_type), name: relation.to_contact.name })}
                </p>
              ))}
            </li>
          ))}
        </ul>
      </ResourceState>

      <ContactFormDialog open={open} onClose={() => setOpen(false)} customerId={customerId} contacts={list} />
    </section>
  )
}
