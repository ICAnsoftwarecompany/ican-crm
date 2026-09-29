// Initials avatar with an unread badge, shared by the WhatsApp and Gmail
// conversation lists (previously two copies differing only in colors and the
// fallback letter).

function getInitials(value = '', fallbackInitial = '') {
  const text = String(value || '').trim()
  if (!text) return fallbackInitial
  return text.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function InitialsAvatar({
  title,
  unreadCount = 0,
  active = false,
  fallbackInitial,
  activeClassName,
  idleClassName,
}) {
  return (
    <span
      className={[
        'relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-sm',
        active ? activeClassName : idleClassName,
      ].join(' ')}
    >
      {getInitials(title, fallbackInitial)}
      {unreadCount > 0 ? (
        <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white ring-2 ring-[var(--surface)]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </span>
  )
}
