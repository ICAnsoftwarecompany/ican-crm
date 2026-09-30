import { MessageSquarePlus, Plus } from 'lucide-react'

export function ClosedConversationPlaceholder({ onStart, channelLabel }) {
  return (
    <div className="flex min-h-[520px] flex-1 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6">
      <button
        type="button"
        onClick={onStart}
        className="group flex max-w-xs flex-col items-center gap-3 text-center"
        aria-label={`بدء محادثة ${channelLabel || ''}`.trim()}
      >
        <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--brand-accent)] shadow-sm transition group-hover:border-[var(--brand-accent)] group-hover:bg-[var(--brand-accent-soft)]">
          <MessageSquarePlus size={28} />
          <span className="absolute -bottom-1 -end-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-accent)] text-white shadow-sm">
            <Plus size={15} />
          </span>
        </span>
        <span className="text-sm font-black text-[var(--text)]">بدء محادثة جديدة</span>
        <span className="text-xs font-semibold leading-5 text-[var(--text-muted)]">
          اختر محادثة من القائمة لفتح الرسائل والانتقال مباشرة إلى مربع الكتابة.
        </span>
      </button>
    </div>
  )
}
