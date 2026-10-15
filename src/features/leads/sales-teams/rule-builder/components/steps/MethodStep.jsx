import { useTranslation } from 'react-i18next'
import { AssignTypePicker } from '../../../components/AssignTypePicker'

/** Step 3: how the leads are handed out — the four assign types, with when to use the selected one. */
export function MethodStep({ builder }) {
  const { t } = useTranslation()
  const { form, errors, setField } = builder

  return (
    <div className="grid gap-4">
      <AssignTypePicker
        value={form.assign_type}
        onChange={(value) => setField('assign_type', value)}
        error={errors.assign_type ? t(`salesTeams.errors.${errors.assign_type}`) : undefined}
      />
      <div className="rounded-lg bg-[var(--surface-2)] p-3 text-sm leading-6">
        <p className="font-semibold text-[var(--text)]">{t('salesTeams.builder.method.whenTitle', { type: t(`salesTeams.assignTypes.${form.assign_type}.label`) })}</p>
        <p className="mt-1 text-[var(--text-muted)]">{t(`salesTeams.builder.method.when.${form.assign_type}`)}</p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {t(form.assign_type === 'user' ? 'salesTeams.builder.method.nextUser' : 'salesTeams.builder.method.nextTeam')}
        </p>
      </div>
    </div>
  )
}
