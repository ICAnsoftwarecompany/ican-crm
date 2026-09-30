import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { CheckboxGroupField, LocalizedTextField } from '../../settings/components/fields/ResourceField'
import { PORTAL_SECTIONS } from '../constants/portalObjects'
import { usePortalAdminMutations, usePortalSettings } from '../api/portalAdminApi'

/** Portal branding and behaviour (spec §43.6): name, logo, color, welcome text, sections, login channels, subdomain. */
export function PortalSettingsPanel({ resource }) {
  const { t } = useTranslation()
  const settings = usePortalSettings()
  const { saveSettings } = usePortalAdminMutations()
  const [form, setForm] = useState(null)
  const errors = getServiceFieldErrors(saveSettings.error)
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))
  useEffect(() => {
    if (settings.data) setForm(settings.data)
  }, [settings.data])

  return (
    <div className="grid gap-4">
      <header className="grid gap-1">
        <h2 className="text-lg font-bold text-[var(--text)]">{t(`${resource.i18nKey}.title`)}</h2>
        <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
      </header>
      <ResourceState isLoading={settings.isLoading || !form} error={settings.error} onRetry={settings.refetch}>
        {form && (
          <form className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" onSubmit={(event) => { event.preventDefault(); saveSettings.mutate(form, { onSuccess: () => toast.success(t('service.portal.done.settingsSaved')) }) }}>
            <LocalizedTextField label={t('service.portal.fields.brandName')} value={form.brand_name} onChange={set('brand_name')} error={errors.brand_name && t('service.settings.validation.required')} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label={t('service.portal.fields.logoUrl')} dir="ltr" value={form.logo_url || ''} onChange={(event) => set('logo_url')(event.target.value)} />
              <div className="grid gap-1.5">
                <label htmlFor="portal-color" className="text-sm font-medium text-[var(--text)]">{t('service.portal.fields.primaryColor')}</label>
                <div className="flex items-center gap-2">
                  <input id="portal-color" type="color" className="h-10 w-12 cursor-pointer rounded border border-[var(--border)] bg-transparent" value={form.primary_color || '#00C2CB'} onChange={(event) => set('primary_color')(event.target.value)} />
                  <Input dir="ltr" aria-label={t('service.portal.fields.primaryColor')} value={form.primary_color || ''} onChange={(event) => set('primary_color')(event.target.value)} error={errors.primary_color && t('service.portal.validation.color')} />
                </div>
              </div>
              <Input label={t('service.portal.fields.subdomain')} dir="ltr" value={form.subdomain || ''} onChange={(event) => set('subdomain')(event.target.value.toLowerCase())} error={errors.subdomain && t('service.portal.validation.subdomain')} />
            </div>
            <LocalizedTextField label={t('service.portal.fields.welcome')} value={form.welcome} onChange={set('welcome')} multiline />
            <CheckboxGroupField label={t('service.portal.fields.sections')} value={form.sections} onChange={set('sections')} options={PORTAL_SECTIONS.map((value) => ({ value, label: t(`service.portal.sections.${value}`) }))} />
            <div className="grid gap-3 sm:grid-cols-3">
              <CheckboxGroupField label={t('service.portal.fields.otpChannels')} value={form.otp_channels} onChange={set('otp_channels')} options={['whatsapp', 'sms', 'email'].map((value) => ({ value, label: t(`service.portal.channels.${value}`) }))} />
              <Select label={t('service.portal.fields.defaultLanguage')} value={form.default_language} onChange={(value) => set('default_language')(value || 'ar')} options={['ar', 'en'].map((value) => ({ value, label: t(`service.settings.fields.language.${value}`) }))} />
              <label className="inline-flex items-center gap-2 self-end text-sm text-[var(--text)]">
                <input type="checkbox" checked={Boolean(form.b2b_password_login)} onChange={(event) => set('b2b_password_login')(event.target.checked)} />
                {t('service.portal.fields.b2bPassword')}
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
              <input type="checkbox" checked={Boolean(form.public_help_center)} onChange={(event) => set('public_help_center')(event.target.checked)} />
              {t('service.portal.fields.publicHelpCenter')}
            </label>
            <Button type="submit" className="w-fit" loading={saveSettings.isPending}>{t('service.portal.save')}</Button>
          </form>
        )}
      </ResourceState>
    </div>
  )
}
