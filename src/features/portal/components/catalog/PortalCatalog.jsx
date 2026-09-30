import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Banknote, Bus, CalendarClock, FileText, Hammer, HelpCircle, PackagePlus, Receipt, Undo2, UserX, Wrench } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi, usePortalList, usePortalMutation } from '../../api/portalApi'
import { usePortalFormat } from '../../utils/format'
import { PortalPage } from '../PortalPage'

const ICONS = { Banknote, Bus, CalendarClock, FileText, Hammer, HelpCircle, PackagePlus, Receipt, Undo2, UserX, Wrench }
const TEXTAREA = 'min-h-[96px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

/** Form built from the catalog item's `form_schema` (spec §44.2); the request becomes a case of its type. */
function RequestDialog({ item, onClose }) {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})
  const [documents, setDocuments] = useState([])
  const submit = usePortalMutation(() => portalApi.post(P.catalogRequest(item.id), { answers, documents }), { onSuccess: (created) => { toast.success(t('portal.cases.created', { number: created.case_number })); onClose(); navigate(`/requests/${created.id}`) } })
  const errors = submit.error?.response?.data?.errors || {}
  const set = (key) => (value) => setAnswers((current) => ({ ...current, [key]: value }))

  return (
    <AppModal isOpen onClose={onClose} title={format.label(item.name)} description={format.label(item.description)} footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>{t('portal.common.cancel')}</Button><Button loading={submit.isPending} onClick={() => submit.mutate()}>{t('portal.catalog.submit')}</Button></div>}>
      <div className="grid gap-3">
        {(item.form_schema || []).map((field) => {
          const label = `${format.label(field.label, field.key)}${field.required ? ' *' : ''}`
          const error = errors[`answers.${field.key}`] && t('portal.errors.required')
          if (field.type === 'textarea') return <div key={field.key} className="grid gap-1.5"><label className="text-sm font-medium" htmlFor={`f-${field.key}`}>{label}</label><textarea id={`f-${field.key}`} dir="auto" className={TEXTAREA} value={answers[field.key] || ''} onChange={(event) => set(field.key)(event.target.value)} />{error && <p className="text-xs text-sla-breached">{error}</p>}</div>
          if (field.type === 'select') return <Select key={field.key} label={label} value={answers[field.key] || ''} onChange={set(field.key)} error={error} options={(field.options || []).map((option) => ({ value: option, label: t(`portal.catalog.options.${option}`, { defaultValue: option }) }))} />
          return <Input key={field.key} label={label} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} dir={field.type === 'text' ? 'auto' : 'ltr'} value={answers[field.key] || ''} onChange={(event) => set(field.key)(event.target.value)} error={error} />
        })}
        {(item.required_documents || []).length > 0 && (
          <fieldset className="grid gap-1.5">
            <legend className="mb-1 text-sm font-medium">{t('portal.catalog.documents')}</legend>
            {item.required_documents.map((doc) => (
              <label key={doc} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                <span>{t(`portal.documents.types.${doc}`, { defaultValue: doc })}</span>
                <input type="file" className="max-w-[12rem] text-xs" onChange={(event) => setDocuments((current) => (event.target.files?.length ? [...new Set([...current, doc])] : current.filter((entry) => entry !== doc)))} />
              </label>
            ))}
            {Object.keys(errors).some((key) => key.startsWith('documents.')) && <p className="text-xs text-sla-breached">{t('portal.catalog.documentsRequired')}</p>}
          </fieldset>
        )}
        {item.requires_payment && item.price != null && <p className="text-sm">{t('portal.catalog.price', { price: format.money(item.price) })}</p>}
      </div>
    </AppModal>
  )
}

export function PortalCatalog() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const query = usePortalList('catalog', P.catalog)
  const [selected, setSelected] = useState(null)
  const items = query.data || []
  return (
    <PortalPage title={t('portal.sections.catalog')} description={t('portal.catalog.description')} query={query} empty={!items.length} emptyTitle={t('portal.catalog.empty')}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon] || FileText
          return (
            <li key={item.id}>
              <button type="button" onClick={() => setSelected(item)} className="grid h-full w-full gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-start transition-colors hover:border-brand-accent">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand-accent-soft)] text-brand-accent"><Icon size={18} aria-hidden="true" /></span>
                <span className="font-semibold">{format.label(item.name)}</span>
                <span className="text-sm text-[var(--text-muted)]">{format.label(item.description)}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {selected && <RequestDialog item={selected} onClose={() => setSelected(null)} />}
    </PortalPage>
  )
}
