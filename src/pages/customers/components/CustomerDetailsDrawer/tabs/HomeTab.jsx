import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  FolderOpen,
  Linkedin,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react'

import { FieldRow, RelatedCard, Section } from '../CustomerDetailsTabPrimitives'
import { fieldValue, formatDateTime } from '../customerDetailsUtils'
import { useTranslation } from 'react-i18next'

export function HomeTab({ customer, layoutMode = 'compact' }) {
  const { t } = useTranslation()
  const attributes = Array.isArray(customer.attributes) ? customer.attributes : []
  const lead = customer.lead
  const isWide = layoutMode === 'wide'

  return (
    <div className="min-w-0 space-y-4 py-4">
      <div className="min-w-0">
        <h3 className="mb-3 text-base font-black text-[var(--text)]">{t('customers.homeTab.fields')}</h3>
        <div className={isWide ? 'grid min-w-0 grid-cols-2 gap-3' : 'min-w-0 space-y-3'}>
          <Section title={t('customers.homeTab.general')}>
            <FieldRow icon={Mail} label={t('customers.homeTab.emails')} value={customer.email} />
            <FieldRow icon={Phone} label={t('customers.homeTab.phones')} value={customer.phone} />
            <FieldRow icon={User} label={t('customers.homeTab.type')} value={customer.type} />
          </Section>

          <Section title={t('customers.homeTab.work')}>
            <FieldRow icon={Building2} label={t('customers.homeTab.company')} value={customer.company} />
            <FieldRow icon={BriefcaseBusiness} label={t('customers.homeTab.jobTitle')} value={customer.job_title || customer.title} />
            <FieldRow icon={ShieldCheck} label={t('customers.homeTab.status')} value={customer.status?.name || customer.status?.status || customer.status_type_id} />
          </Section>

          <Section title={t('customers.homeTab.social')}>
            <FieldRow icon={Linkedin} label={t('customers.homeTab.linkedin')} value={customer.linkedin || customer.linkedin_url} />
          </Section>

          <Section title={t('customers.homeTab.system')}>
            <FieldRow icon={CalendarDays} label={t('customers.homeTab.creationDate')} value={formatDateTime(customer.created_at || customer.createdAt)} />
            <FieldRow icon={Clock3} label={t('customers.homeTab.updatedAt')} value={formatDateTime(customer.updated_at || customer.updatedAt)} />
            <FieldRow icon={ShieldCheck} label={t('customers.homeTab.createdBy')} value={customer.created_by || customer.linked_by || t('customers.homeTab.systemUser')} />
            <FieldRow icon={FileText} label={t('customers.homeTab.id')} value={customer.id} />
            <FieldRow icon={FileText} label={t('customers.homeTab.code')} value={customer.code} />
          </Section>
        </div>
      </div>

      <div className={isWide ? 'grid min-w-0 grid-cols-2 gap-3' : 'space-y-4'}>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-[var(--text)]">{t('customers.homeTab.company')}</h3>
            <Building2 size={15} className="text-[#007A80]" />
          </div>
          <div className="inline-flex max-w-full rounded-md bg-[#F3FAFB] px-2 py-1 text-sm font-semibold text-[var(--text)] ring-1 ring-[#E5F7F8]">
            <span className="min-w-0 break-words">{fieldValue(customer.company)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-[var(--text)]">{t('customers.homeTab.relatedData')}</h3>
            <FolderOpen size={15} className="text-[#007A80]" />
          </div>
          <div className={isWide ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            <RelatedCard title={t('customers.homeTab.attributes')} subtitle={t('customers.homeTab.itemsCount', { count: attributes.length })} icon={FileText} />
            <RelatedCard
              title={t('customers.homeTab.lead')}
              subtitle={lead ? fieldValue(lead.name || lead.email || t('customers.homeTab.leadNumber', { id: lead.id })) : t('customers.homeTab.noLinkedLead')}
              icon={User}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
