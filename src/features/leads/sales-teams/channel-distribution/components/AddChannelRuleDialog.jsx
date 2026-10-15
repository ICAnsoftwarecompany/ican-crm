import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../../shared/components/ui/Input'
import { cn } from '../../../../../shared/utils/cn'
import { extractMessage } from '../../../../../shared/utils/apiResponse'
import { buildChannelRulePayload, nextChannelPriority, rulesForChannel, usersWithRule, validateChannelRule } from '../utils/channelDistributionModel'

const selectClass = 'h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--brand-accent)]'

/**
 * Add a user to a channel's distribution: page / number, user, priority and active. Shows the priorities already
 * used in the same channel + page / number, so the new user gets a free place (click a free number to use it).
 */
export function AddChannelRuleDialog({ channel, rules, users, identifiers, userNames, mutation, onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ identifier: '', user_id: '', priority: String(nextChannelPriority(rules, channel, '')), active: true })
  const [errors, setErrors] = useState({})
  const scopeRules = rulesForChannel(rules, channel).filter((rule) => rule.identifier === form.identifier)
  const taken = usersWithRule(rules, channel, form.identifier)
  const set = (key, value) => {
    setErrors((current) => ({ ...current, [key]: undefined }))
    setForm((current) => {
      const nextForm = { ...current, [key]: value }
      if (key === 'identifier') nextForm.priority = String(nextChannelPriority(rules, channel, value))
      return nextForm
    })
  }

  const submit = async () => {
    const found = validateChannelRule(form, rules, channel)
    if (Object.keys(found).length) {
      setErrors(found)
      return
    }
    try {
      await mutation.mutateAsync(buildChannelRulePayload(channel, form))
      toast.success(t('salesTeams.channels.rules.created'))
      onClose()
    } catch (error) {
      setErrors({ server: extractMessage(error, t('salesTeams.channels.rules.saveFailed')) })
    }
  }

  const err = (key) => (errors[key] ? t(`salesTeams.errors.${errors[key]}`) : '')
  const usedPriorities = new Set(scopeRules.map((rule) => rule.priority))
  const freeNumbers = Array.from({ length: Math.max(...usedPriorities, 0) + 1 }, (_, index) => index + 1).filter((value) => !usedPriorities.has(value)).slice(0, 6)

  return (
    <FormDialog
      open
      onClose={onClose}
      onSubmit={submit}
      loading={mutation.isPending}
      size="lg"
      className="sm:max-w-xl"
      title={t('salesTeams.channels.rules.addTitle', { channel: t(`salesTeams.channels.names.${channel}`) })}
      description={t('salesTeams.channels.rules.addDescription')}
      submitText={t('salesTeams.channels.rules.add')}
    >
      <div className="grid gap-4">
        <div className="grid gap-1">
          <label htmlFor="channel-rule-identifier" className="text-sm font-medium text-[var(--text)]">{t(`salesTeams.channels.identifier.${channel}`, { defaultValue: t('salesTeams.channels.identifier.default') })}</label>
          <select id="channel-rule-identifier" value={form.identifier} onChange={(event) => set('identifier', event.target.value)} className={selectClass}>
            <option value="">{t('salesTeams.channels.identifier.all')}</option>
            {identifiers.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <p className="text-xs text-[var(--text-muted)]">{t('salesTeams.channels.identifier.hint')}</p>
        </div>

        <div className="grid gap-1">
          <label htmlFor="channel-rule-user" className="text-sm font-medium text-[var(--text)]">{t('salesTeams.rules.targetUser')}</label>
          <select id="channel-rule-user" value={form.user_id} onChange={(event) => set('user_id', event.target.value)} className={cn(selectClass, errors.user_id && 'border-red-500')}>
            <option value="">{t('common.choose')}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id} disabled={taken.has(user.id)}>
                {user.name}{user.type ? ` · ${user.type}` : ''}{taken.has(user.id) ? ` (${t('salesTeams.channels.rules.alreadyIn')})` : ''}
              </option>
            ))}
          </select>
          {errors.user_id && <p className="text-xs text-red-600 dark:text-red-300">{err('user_id')}</p>}
        </div>

        <div className="grid gap-2 rounded-lg bg-[var(--surface-2)] p-3">
          <p className="text-sm font-semibold text-[var(--text)]">{t('salesTeams.channels.rules.currentOrder', { count: scopeRules.length })}</p>
          {scopeRules.length ? (
            <ol className="grid gap-1">
              {scopeRules.map((rule) => (
                <li key={rule.id} className="flex items-center gap-2 text-sm">
                  <span className="inline-flex h-6 min-w-8 items-center justify-center rounded bg-[var(--surface)] px-1 text-xs font-bold text-[var(--text)]">{rule.priority}</span>
                  <span className={cn('text-[var(--text)]', !rule.active && 'opacity-60')}>{userNames.get(rule.userId) || rule.userName || `#${rule.userId}`}</span>
                  {!rule.active && <span className="text-xs text-[var(--text-muted)]">({t('salesTeams.common.inactive')})</span>}
                </li>
              ))}
            </ol>
          ) : <p className="text-xs text-[var(--text-muted)]">{t('salesTeams.channels.rules.noneYet')}</p>}
        </div>

        <div className="grid gap-2">
          <div className="w-36">
            <Input type="number" min="1" step="1" label={t('salesTeams.rules.priority')} value={form.priority} onChange={(event) => set('priority', event.target.value)} error={err('priority') || undefined} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span>{t('salesTeams.channels.rules.freeNumbers')}</span>
            {freeNumbers.map((value) => (
              <button key={value} type="button" onClick={() => set('priority', String(value))} className={cn('rounded-md border px-2 py-0.5 font-semibold', String(value) === form.priority ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]')}>
                {value}
              </button>
            ))}
          </div>
        </div>

        <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
          <input type="checkbox" className="h-4 w-4 accent-[var(--brand-accent)]" checked={form.active} onChange={(event) => set('active', event.target.checked)} />
          {t('salesTeams.channels.rules.activeLabel')}
        </label>
        {errors.server && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{errors.server}</p>}
      </div>
    </FormDialog>
  )
}
