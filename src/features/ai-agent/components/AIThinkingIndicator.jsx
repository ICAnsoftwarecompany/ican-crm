import { Sparkles } from 'lucide-react'

export function AIThinkingIndicator({ label = 'AI يفكر...' }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#A0ECF0] bg-[#E8F9FA] px-3 py-1 text-xs font-arabic text-[#007A80]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C2CB] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C2CB]" />
      </span>
      <Sparkles size={13} />
      {label}
    </div>
  )
}
