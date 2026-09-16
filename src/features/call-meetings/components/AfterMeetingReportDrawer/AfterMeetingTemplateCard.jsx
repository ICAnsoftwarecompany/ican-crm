import { getAfterMeetingCategoryLabel } from './afterMeetingTemplates'

export function AfterMeetingTemplateCard({ template, selected, onSelect }) {
  const Icon = template.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'rounded-xl border p-3 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
        selected
          ? 'border-[#00C2CB] bg-[#F0FCFD] ring-2 ring-[#BEEFF2]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[#9CE3E7]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EAFBFC] text-[#007A80]">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-black text-[var(--text)]">{template.title}</div>
          <div className="mt-1 text-xs font-semibold leading-5 text-[var(--muted)]">
            {template.description}
          </div>
          <div className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#007A80]">
            {getAfterMeetingCategoryLabel(template.category)}
          </div>
        </div>
      </div>
    </button>
  )
}
