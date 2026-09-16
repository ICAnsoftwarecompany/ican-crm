import { AFTER_MEETING_TEMPLATES } from './afterMeetingTemplates'
import { AfterMeetingTemplateCard } from './AfterMeetingTemplateCard'

export function AfterMeetingTemplateSelector({ selectedTemplateId, onSelect }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {AFTER_MEETING_TEMPLATES.map((template) => (
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
