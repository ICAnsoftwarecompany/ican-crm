import { useTranslation } from 'react-i18next'
import { Input } from '../../../../../../shared/components/ui/Input'

const NAME_IDEAS = ['facebookLeads', 'whatsappLeads', 'vipLeads', 'campaignLeads', 'everythingElse']

/** Step 1: the rule's name, with ideas the user can click. */
export function BasicsStep({ builder }) {
  const { t } = useTranslation()
  const { form, errors, setField } = builder

  return (
    <div className="grid gap-4">
      <Input
        label={t('salesTeams.rules.name')}
        value={form.name}
        onChange={(event) => setField('name', event.target.value)}
        placeholder={t('salesTeams.rules.namePlaceholder')}
        error={errors.name ? t(`salesTeams.errors.${errors.name}`) : undefined}
        hint={errors.name ? undefined : t('salesTeams.builder.basics.nameHint')}
        autoFocus
      />
      <div>
        <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">{t('salesTeams.builder.basics.ideas')}</p>
        <div className="flex flex-wrap gap-1.5">
          {NAME_IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => setField('name', t(`salesTeams.builder.basics.nameIdeas.${idea}`))}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
            >
              {t(`salesTeams.builder.basics.nameIdeas.${idea}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
