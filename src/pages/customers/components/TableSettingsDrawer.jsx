import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { useTranslation } from 'react-i18next'

const sections = [
  {
    id: 'density',
    items: ['comfortable', 'medium', 'compact'],
  },
  {
    id: 'columns',
    items: ['showHide', 'reorder'],
  },
  {
    id: 'pinning',
    items: ['pinFromHeader', 'unpin'],
  },
  {
    id: 'typography',
    items: ['fontSize', 'fontWeight', 'colors'],
  },
  {
    id: 'saving',
    items: ['formattingRules', 'localPreferences'],
  },
]

export function TableSettingsDrawer({ open, onClose }) {
  const { t } = useTranslation()
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={t('customers.tableSettings.title')}
      description={t('customers.tableSettings.description')}
      size="lg"
      className="w-full sm:w-[30rem]"
    >
      <div className="space-y-3">
        {sections.map((section) => (
          <section key={section.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <h3 className="text-sm font-bold text-[var(--text)]">{t(`customers.tableSettings.sections.${section.id}.title`)}</h3>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--text-muted)]">
              {section.items.map((item) => (
                <li key={item}>{t(`customers.tableSettings.sections.${section.id}.${item}`)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AppDrawer>
  )
}
