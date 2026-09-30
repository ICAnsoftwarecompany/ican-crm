import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi, usePortalMutation } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { Card, PortalPage } from '../PortalPage'

const TEXTAREA = 'min-h-[120px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

/** A free-text request. Typed services with their own form live in the request catalog. */
export function PortalNewCase() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { can } = usePortalAccess()
  const about = params.get('about')
  const [subject, setSubject] = useState(about ? t('portal.cases.aboutSubject', { reference: about }) : '')
  const [description, setDescription] = useState('')
  const create = usePortalMutation((payload) => portalApi.post(P.cases, payload), { onSuccess: (item) => { toast.success(t('portal.cases.created', { number: item.case_number })); navigate(`/requests/${item.id}`) } })
  const errors = create.error?.response?.data?.errors || {}

  return (
    <PortalPage title={t('portal.cases.new')} description={t('portal.cases.newDescription')}>
      <Card className="grid max-w-2xl gap-3">
        {can('catalog') && <p className="text-sm text-[var(--text-muted)]">{t('portal.cases.catalogHint')} <Link to="/catalog" className="underline">{t('portal.sections.catalog')}</Link></p>}
        <Input label={t('portal.cases.subject')} dir="auto" value={subject} onChange={(event) => setSubject(event.target.value)} error={errors.subject && t('portal.errors.required')} />
        <div className="grid gap-1.5">
          <label htmlFor="portal-description" className="text-sm font-medium">{t('portal.cases.details')}</label>
          <textarea id="portal-description" dir="auto" className={TEXTAREA} value={description} onChange={(event) => setDescription(event.target.value)} />
          {errors.description && <p className="text-xs text-sla-breached">{t('portal.errors.required')}</p>}
        </div>
        <Button className="w-fit" loading={create.isPending} onClick={() => create.mutate({ subject, description })}>{t('portal.cases.submit')}</Button>
      </Card>
    </PortalPage>
  )
}
