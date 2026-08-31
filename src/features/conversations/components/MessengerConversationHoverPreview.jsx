import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle } from 'lucide-react'
import { getMessengerLastCustomerMessagePreview } from '../utils/messengerConversations'

export function MessengerConversationHoverPreview({ conversation }) {
  const anchorRef = useRef(null)
  const hoverTimerRef = useRef(null)
  const [previewRect, setPreviewRect] = useState(null)
  const preview = getMessengerLastCustomerMessagePreview(conversation)

  useEffect(() => {
    const parent = anchorRef.current?.parentElement
    if (!parent || !preview) return undefined

    const updatePreviewRect = () => {
      const rect = parent.getBoundingClientRect()
      const width = Math.min(340, Math.max(240, rect.width - 24))
      const left = Math.max(12, Math.min(rect.left + 12, window.innerWidth - width - 12))
      const belowTop = rect.bottom + 8
      const aboveTop = rect.top - 96
      const top = belowTop + 96 > window.innerHeight ? Math.max(12, aboveTop) : belowTop
      setPreviewRect({ left, top, width })
    }

    const openPreview = () => {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = window.setTimeout(updatePreviewRect, 500)
    }

    const closePreview = () => {
      window.clearTimeout(hoverTimerRef.current)
      setPreviewRect(null)
    }

    const syncPreview = () => {
      if (!previewRect) return
      updatePreviewRect()
    }

    parent.addEventListener('mouseenter', openPreview)
    parent.addEventListener('mouseleave', closePreview)
    parent.addEventListener('focusin', openPreview)
    parent.addEventListener('focusout', closePreview)
    window.addEventListener('scroll', syncPreview, true)
    window.addEventListener('resize', syncPreview)

    return () => {
      parent.removeEventListener('mouseenter', openPreview)
      parent.removeEventListener('mouseleave', closePreview)
      parent.removeEventListener('focusin', openPreview)
      parent.removeEventListener('focusout', closePreview)
      window.clearTimeout(hoverTimerRef.current)
      window.removeEventListener('scroll', syncPreview, true)
      window.removeEventListener('resize', syncPreview)
    }
  }, [preview, previewRect])

  if (!preview) return null

  return (
    <>
      <span ref={anchorRef} className="hidden" />
      {previewRect && typeof document !== 'undefined'
        ? createPortal(
            <div
              dir="auto"
              className="pointer-events-none fixed z-[9999] rounded-xl border border-[#CFE8EB] bg-white/95 p-3 text-start shadow-2xl backdrop-blur"
              style={{
                left: previewRect.left,
                top: previewRect.top,
                width: previewRect.width,
              }}
            >
              <div className="mb-1 flex items-center gap-1 text-[10px] font-black text-[#007A80]">
                <MessageCircle size={12} />
                <span>{'\u0622\u062e\u0631 \u0631\u0633\u0627\u0644\u0629 \u0645\u0646 \u0627\u0644\u0639\u0645\u064a\u0644'}</span>
              </div>
              <div className="line-clamp-3 text-xs font-bold leading-5 text-[#0F172A]">
                {preview}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
