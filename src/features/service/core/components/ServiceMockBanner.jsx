import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FlaskConical } from 'lucide-react'
import { Select } from '../../../../shared/components/ui/Select'
import { SERVICE_MODULES } from '../constants/serviceModules'
import { serviceKeys } from '../constants/queryKeys'
import { isModuleMocked } from '../api/serviceHttp'
import { MOCK_TEMPLATE_KEYS } from '../../mocks/templates'

/**
 * Visible whenever at least one Service module is served by mock data.
 * Lets developers preview every industry template to prove screens are
 * configuration-driven (a screen that breaks on another template is a bug).
 */
export function ServiceMockBanner({ activeTemplate }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [switching, setSwitching] = useState(false)
  const mockedCount = SERVICE_MODULES.filter((module) => isModuleMocked(module.key)).length

  if (mockedCount === 0) return null

  const templateOptions = MOCK_TEMPLATE_KEYS.map((key) => ({ value: key, label: t(`service.mock.templates.${key}`) }))

  const handleTemplateChange = async (templateKey) => {
    if (!templateKey) return
    setSwitching(true)
    try {
      const { setActiveMockTemplate } = await import('../../mocks/db')
      setActiveMockTemplate(templateKey)
      await queryClient.invalidateQueries({ queryKey: serviceKeys.all })
    } finally {
      setSwitching(false)
    }
  }

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-lg border border-[var(--ai-border)] bg-[var(--ai-bg)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2 text-[var(--ai-text)]">
        <FlaskConical size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{t('service.mock.title')}</p>
          <p className="text-xs">{t('service.mock.description', { count: mockedCount, total: SERVICE_MODULES.length })}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--ai-text)]">
        <span className="shrink-0">{t('service.mock.template')}</span>
        <Select
          value={activeTemplate || ''}
          options={templateOptions}
          onChange={handleTemplateChange}
          disabled={switching}
          aria-label={t('service.mock.template')}
          className="min-w-[10rem]"
        />
      </div>
    </div>
  )
}
