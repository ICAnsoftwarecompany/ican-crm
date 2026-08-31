import { Sparkles } from 'lucide-react'

export function EmptyState({ icon, title, description, action, aiSuggestion }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium mb-1 font-arabic text-[var(--text)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-xs mb-5 font-arabic">{description}</p>
      )}
      {aiSuggestion && (
        <div className="bg-[#E8F9FA] border border-[#A0ECF0] rounded-lg p-3 mb-4 max-w-sm flex items-start gap-2">
          <Sparkles size={16} className="text-[#00C2CB] mt-0.5 shrink-0" />
          <p className="text-sm text-[#007A80] font-arabic text-start">{aiSuggestion}</p>
        </div>
      )}
      {action}
    </div>
  )
}
