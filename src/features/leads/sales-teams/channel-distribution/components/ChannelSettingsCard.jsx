import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check, Settings2, Trash2 } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { Badge } from '../../../../../shared/components/ui/Badge'
import { ConfirmDialog } from '../../../../../shared/components/overlays/ConfirmDialog'
import { cn } from '../../../../../shared/utils/cn'
import { extractMessage } from '../../../../../shared/utils/apiResponse'
import { FALLBACK_STRATEGIES, STRATEGIES, buildSettingPayload, toSettingForm } from '../utils/channelDistributionModel'

/** One channel's distribution setting: strategy, fallback, active. Create (POST) or update (PUT), delete. */
export function ChannelSettingsCard({ channel, setting, mutations }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(() => toSettingForm(setting))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const saving = mutations.createSetting.isPending || mutations.updateSetting.isPending
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const save = async () => {
    try {
      const payload = buildSettingPayload(channel, form, setting?.identifier)
      if (setting?.id) await mutations.updateSetting.mutateAsync({ id: setting.id, payload })
      else await mutations.createSetting.mutateAsync(payload)
      toast.success(t('salesTeams.channels.settings.saved'))
    } catch (error) {
      toast.error(extractMessage(error, t('salesTeams.channels.settings.saveFailed')))
    }
  }

  const remove = async () => {
    setConfirmDelete(false)
    try {
      await mutations.deleteSetting.mutateAsync(setting.id)
      setForm(toSettingForm(null))
      toast.success(t('salesTeams.channels.settings.deleted'))
    } catch (error) {
      toast.error(extractMessage(error, t('salesTeams.channels.settings.saveFailed')))
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-labelledby={`settings-${channel}`}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={`settings-${channel}`} className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <Settings2 size={17} className="text-[var(--brand-accent)]" aria-hidden="true" />
            {t('salesTeams.channels.settings.title', { channel: t(`salesTeams.channels.names.${channel}`) })}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{t('salesTeams.channels.settings.description')}</p>
        </div>
        <Badge variant={setting ? (setting.active ? 'success' : 'danger') : 'warning'}>
          {setting ? t(setting.active ? 'salesTeams.common.active' : 'salesTeams.common.inactive') : t('salesTeams.channels.settings.notSet')}
        </Badge>
      </header>

      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{t('salesTeams.channels.settings.strategy')}</legend>
        <div role="radiogroup" className="grid gap-2 md:grid-cols-3">
          {STRATEGIES.map((strategy) => {
            const selected = form.strategy === strategy
            return (
              <button
                key={strategy}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set('strategy', strategy)}
                className={cn('rounded-lg border p-3 text-start transition-colors', selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]">
                  {selected && <Check size={14} className="text-[var(--brand-accent)]" aria-hidden="true" />}
                  {t(`salesTeams.channels.strategies.${strategy}.label`)}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">{t(`salesTeams.channels.strategies.${strategy}.description`)}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-1 sm:max-w-md">
        <label htmlFor={`fallback-${channel}`} className="text-sm font-medium text-[var(--text)]">{t('salesTeams.channels.settings.fallback')}</label>
        <select
          id={`fallback-${channel}`}
          value={form.fallbackStrategy}
          onChange={(event) => set('fallbackStrategy', event.target.value)}
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
        >
          {FALLBACK_STRATEGIES.map((value) => <option key={value} value={value}>{t(`salesTeams.channels.fallbacks.${value}.label`)}</option>)}
        </select>
        <p className="text-xs leading-5 text-[var(--text-muted)]">{t(`salesTeams.channels.fallbacks.${form.fallbackStrategy}.description`)}</p>
      </div>

      <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
        <input type="checkbox" className="h-4 w-4 accent-[var(--brand-accent)]" checked={form.active} onChange={(event) => set('active', event.target.checked)} />
        {t('salesTeams.channels.settings.active')}
      </label>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-[var(--border)] pt-3">
        {setting?.id ? (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)} disabled={mutations.deleteSetting.isPending}>
            <Trash2 size={15} />
            {t('salesTeams.channels.settings.delete')}
          </Button>
        ) : <span />}
        <Button variant="accent" onClick={save} loading={saving}>{setting?.id ? t('salesTeams.common.save') : t('salesTeams.channels.settings.create')}</Button>
      </footer>

      <ConfirmDialog
        isOpen={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        type="danger"
        onConfirm={remove}
        title={t('salesTeams.channels.settings.deleteTitle')}
        message={t('salesTeams.channels.settings.deleteMessage', { channel: t(`salesTeams.channels.names.${channel}`) })}
        confirmText={t('salesTeams.channels.settings.delete')}
      />
    </section>
  )
}
