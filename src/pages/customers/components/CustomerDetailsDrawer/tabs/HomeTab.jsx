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

export function HomeTab({ customer, layoutMode = 'compact' }) {
  const attributes = Array.isArray(customer.attributes) ? customer.attributes : []
  const lead = customer.lead
  const isWide = layoutMode === 'wide'

  return (
    <div className="min-w-0 space-y-4 py-4">
      <div className="min-w-0">
        <h3 className="mb-3 text-base font-black text-[var(--text)]">Fields</h3>
        <div className={isWide ? 'grid min-w-0 grid-cols-2 gap-3' : 'min-w-0 space-y-3'}>
          <Section title="General">
            <FieldRow icon={Mail} label="Emails" value={customer.email} />
            <FieldRow icon={Phone} label="Phones" value={customer.phone} />
            <FieldRow icon={User} label="Type" value={customer.type} />
          </Section>

          <Section title="Work">
            <FieldRow icon={Building2} label="Company" value={customer.company} />
            <FieldRow icon={BriefcaseBusiness} label="Job Title" value={customer.job_title || customer.title} />
            <FieldRow icon={ShieldCheck} label="Status" value={customer.status?.name || customer.status?.status || customer.status_type_id} />
          </Section>

          <Section title="Social">
            <FieldRow icon={Linkedin} label="Linkedin" value={customer.linkedin || customer.linkedin_url} />
          </Section>

          <Section title="System">
            <FieldRow icon={CalendarDays} label="Creation date" value={formatDateTime(customer.created_at || customer.createdAt)} />
            <FieldRow icon={Clock3} label="Updated at" value={formatDateTime(customer.updated_at || customer.updatedAt)} />
            <FieldRow icon={ShieldCheck} label="Created by" value={customer.created_by || customer.linked_by || 'System'} />
            <FieldRow icon={FileText} label="ID" value={customer.id} />
            <FieldRow icon={FileText} label="Code" value={customer.code} />
          </Section>
        </div>
      </div>

      <div className={isWide ? 'grid min-w-0 grid-cols-2 gap-3' : 'space-y-4'}>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-[var(--text)]">Company</h3>
            <Building2 size={15} className="text-[#007A80]" />
          </div>
          <div className="inline-flex max-w-full rounded-md bg-[#F3FAFB] px-2 py-1 text-sm font-semibold text-[var(--text)] ring-1 ring-[#E5F7F8]">
            <span className="min-w-0 break-words">{fieldValue(customer.company)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-[var(--text)]">Related Data</h3>
            <FolderOpen size={15} className="text-[#007A80]" />
          </div>
          <div className={isWide ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            <RelatedCard title="Attributes" subtitle={`${attributes.length} items`} icon={FileText} />
            <RelatedCard
              title="Lead"
              subtitle={lead ? fieldValue(lead.name || lead.email || `Lead #${lead.id}`) : 'No linked lead'}
              icon={User}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
