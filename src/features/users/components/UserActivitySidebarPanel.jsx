import { UserRound, X } from 'lucide-react'

export function UserActivitySidebarPanel({ open, onClose }) {
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'

  return (
    <aside
      className="fixed end-0 top-12 bottom-0 z-30 w-[min(390px,calc(100vw-72px))] border-s border-[#DDECEF] bg-white shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
      style={{ transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})` }}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <header className="border-b border-[#E5EEF0] bg-[#F8FEFF] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#00878D]">
                <UserRound size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-[#111827]">سجل المستخدم</h2>
                <p className="truncate text-xs font-semibold text-[#64748B]">البيانات تُعرض داخل قائمة المستخدمين النشطين</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#64748B]"
            >
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center p-4 text-center text-xs font-semibold text-[#64748B]">
          لا يتم استخدام هذه اللوحة الآن؛ يتم جلب سجل المستخدم داخل قائمة المستخدمين النشطين عند اختيار مستخدم.
        </div>
      </div>
    </aside>
  )
}
