import { ExternalLink, GripHorizontal, Maximize2, Minimize2, RotateCcw, X } from 'lucide-react'

function getInitial() {
  return 'C'
}

function IconButton({ title, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
    >
      <Icon size={16} />
    </button>
  )
}

export function FloatingChatHeader({
  customer,
  channelLabel,
  channelIcon: ChannelIcon,
  channelColor = '#00C2CB',
  isMinimized,
  isMaximized,
  onMinimize,
  onMaximize,
  onRestore,
  onReset,
  onClose,
  onOpenSidebar,
  openSidebarTitle = 'فتح في لوحة المحادثات',
  onDragStart,
}) {
  return (
    <div
      className="flex min-h-16 cursor-grab touch-none select-none items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2 active:cursor-grabbing"
      onPointerDown={onDragStart}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-sm" style={{ backgroundColor: channelColor }}>
        {ChannelIcon ? <ChannelIcon size={19} /> : getInitial(customer)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="truncate text-sm font-black text-[var(--text)]">نافذة المحادثة</div>
          <span className="shrink-0 rounded-full bg-[#E8F9FA] px-2 py-0.5 text-[10px] font-bold text-[#007A80]">
            {channelLabel}
          </span>
        </div>
        <div className="mt-0.5 truncate text-xs font-semibold text-[var(--text-muted)]">
          اسحب النافذة أو غيّر الحجم
        </div>
      </div>

      <GripHorizontal size={17} className="hidden shrink-0 text-[var(--text-muted)] sm:block" />

      <div className="flex shrink-0 items-center gap-1">
        {onOpenSidebar ? <IconButton title={openSidebarTitle} icon={ExternalLink} onClick={onOpenSidebar} /> : null}
        <IconButton title={isMinimized ? 'استعادة' : 'تصغير'} icon={Minimize2} onClick={isMinimized ? onRestore : onMinimize} />
        <IconButton title={isMaximized ? 'استعادة الحجم' : 'تكبير'} icon={Maximize2} onClick={isMaximized ? onRestore : onMaximize} />
        <IconButton title="إعادة ضبط" icon={RotateCcw} onClick={onReset} />
        <IconButton title="إغلاق" icon={X} onClick={onClose} />
      </div>
    </div>
  )
}
