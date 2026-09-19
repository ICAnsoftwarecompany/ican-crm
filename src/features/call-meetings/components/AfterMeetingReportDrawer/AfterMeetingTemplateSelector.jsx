import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getAfterMeetingTemplates } from './afterMeetingTemplates'
import { AfterMeetingTemplateCard } from './AfterMeetingTemplateCard'

export function AfterMeetingTemplateSelector({ selectedTemplateId, onSelect }) {
  const { t } = useTranslation()
  const templates = useMemo(() => getAfterMeetingTemplates(t), [t])

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {templates.map((template) => (
        <AfterMeetingTemplateCard
          key={template.id}
          template={template}
          selected={selectedTemplateId === template.id}
          onSelect={() => onSelect(template.id)}
        />
      ))}
    </div>
  )
}
