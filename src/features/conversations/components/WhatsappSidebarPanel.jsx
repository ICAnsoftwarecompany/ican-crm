import { WhatsappConversationsWorkspace } from './WhatsappConversationsWorkspace'

export function WhatsappSidebarPanel({ open, onClose, initialTarget = {} }) {
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'

  return (
    <aside
      className="fixed end-0 top-12 bottom-0 z-30 w-[min(390px,calc(100vw-72px))] border-s border-[#BDEFD1] bg-white shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
      style={{
        transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})`,
      }}
      aria-hidden={!open}
    >
      <WhatsappConversationsWorkspace
        panel
        open={open}
        onClose={onClose}
        initialTarget={initialTarget}
      />
    </aside>
  )
}
