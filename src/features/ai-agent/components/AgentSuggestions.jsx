import { Sparkles } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { getAiPermission, AI_PERMISSION_LEVELS } from '../services/agentPermissions'

export function AgentSuggestions({ suggestions = [], onRun }) {
  if (!suggestions.length) {
    return null
  }

  return (
    <div className="rounded-lg border border-[#A0ECF0] bg-[#E8F9FA] p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#007A80]">
        <Sparkles size={16} />
        اقتراحات AI
      </div>
      <div className="grid gap-2">
        {suggestions.map((suggestion, index) => {
          const permission = getAiPermission(suggestion.action)
          const blocked = permission === AI_PERMISSION_LEVELS.NEVER_ALLOW

          return (
            <div key={suggestion.id || index} className="rounded-lg bg-white/70 p-3">
              <p className="text-sm font-arabic text-[var(--text)]">{suggestion.title || suggestion.text}</p>
              <p className="mt-1 text-xs text-[#007A80]">الصلاحية: {permission}</p>
              <Button
                className="mt-2"
                variant={blocked ? 'outline' : 'ai'}
                size="sm"
                disabled={blocked}
                onClick={() => onRun?.(suggestion)}
              >
                {blocked ? 'غير مسموح' : 'تنفيذ'}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
