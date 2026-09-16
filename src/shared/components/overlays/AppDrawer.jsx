import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const sizes = {
  sm: 320,
  md: 384,
  lg: 448,
  xl: 640,
}

export function AppDrawer({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
  closeOnBackdrop = true,
  avoidRightSidebar = false,
  pushPage = true,
  pushPageOffset,
  pushPageMinWidth = 1024,
  drawerKey,
  resizable = true,
  minWidth = 300,
  maxWidth = 900,
  topOffset = 0,
  containerClassName,
  portal = false,
  headerActions,
  inlineEndOffset,
  offsetCssVariable,
}) {
  const panelRef = useRef(null)
  const defaultWidth = sizes[size] || sizes.md
  const storageKey = useMemo(
    () => `app-drawer-width:${String(drawerKey || title || size || 'default').trim().toLowerCase()}`,
    [drawerKey, size, title]
  )
  const [drawerWidth, setDrawerWidth] = useState(defaultWidth)

  const clampWidth = (value) => {
    const widthNumber = Number(value)
    const min = Math.max(Number(minWidth) || 300, 260)
    const maxByScreen = Math.max(window.innerWidth - 16, min)
    const maxConfigured = Number(maxWidth) || maxByScreen
    const max = Math.max(min, Math.min(maxConfigured, maxByScreen))
    return Math.min(max, Math.max(min, Number.isFinite(widthNumber) ? widthNumber : defaultWidth))
  }

  const setDrawerWidthSafe = (value) => {
    setDrawerWidth(clampWidth(value))
  }

  useEffect(() => {
    if (!resizable) {
      setDrawerWidth(defaultWidth)
      return
    }

    try {
      const savedValue = Number(window.localStorage.getItem(storageKey) || '')
      if (Number.isFinite(savedValue) && savedValue > 0) {
        setDrawerWidthSafe(savedValue)
        return
      }
    } catch {
      // Ignore storage errors and keep default width.
    }

    setDrawerWidth(defaultWidth)
  }, [defaultWidth, resizable, storageKey])

  useEffect(() => {
    if (!resizable) return

    try {
      window.localStorage.setItem(storageKey, String(Math.round(drawerWidth)))
    } catch {
      // Ignore storage errors.
    }
  }, [drawerWidth, resizable, storageKey])

  useEffect(() => {
    if (!open) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!pushPage) return undefined

    const defaultOffsets = {
      sm: '20rem',
      md: '24rem',
      lg: '28rem',
      xl: 'min(40rem, calc(100vw - 1rem))',
    }

    const applyOffset = () => {
      const isWideEnough = window.matchMedia(`(min-width: ${pushPageMinWidth}px)`).matches
      const dynamicOffset = `${Math.round(drawerWidth)}px`
      const nextOffset = open && isWideEnough ? (pushPageOffset || dynamicOffset || defaultOffsets[size] || defaultOffsets.md) : '0px'
      document.documentElement.style.setProperty('--layout-page-drawer-offset', nextOffset)
    }

    applyOffset()
    window.addEventListener('resize', applyOffset)

    return () => {
      window.removeEventListener('resize', applyOffset)
      document.documentElement.style.setProperty('--layout-page-drawer-offset', '0px')
    }
  }, [drawerWidth, open, pushPage, pushPageMinWidth, pushPageOffset, size])

  useEffect(() => {
    if (!offsetCssVariable) return undefined

    if (open) {
      document.documentElement.style.setProperty(offsetCssVariable, `${Math.round(drawerWidth)}px`)
    }

    return () => {
      document.documentElement.style.setProperty(offsetCssVariable, '0px')
    }
  }, [drawerWidth, offsetCssVariable, open])

  const handleResizeStart = (event) => {
    if (!resizable) return

    event.preventDefault()
    event.stopPropagation()

    const panel = panelRef.current
    if (!panel) return

    const { left, right } = panel.getBoundingClientRect()
    const isRtl = document?.documentElement?.dir === 'rtl'
    const fixedEdge = isRtl ? left : right

    const onMouseMove = (moveEvent) => {
      const nextWidth = isRtl ? moveEvent.clientX - fixedEdge : fixedEdge - moveEvent.clientX
      setDrawerWidthSafe(nextWidth)
    }

    const onMouseUp = () => {
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  if (!open) return null

  const drawerId = `drawer-${title?.replace(/\s+/g, '-')}`
  const descriptionId = description ? `${drawerId}-description` : undefined
  const rightSidebarOffset = inlineEndOffset || (avoidRightSidebar ? 'var(--layout-right-sidebar-offset, 0px)' : '0px')
  const resolvedTopOffset = typeof topOffset === 'number'
    ? `${Math.max(topOffset, 0)}px`
    : (String(topOffset || '0px').trim() || '0px')
  const containerInlineSize = closeOnBackdrop ? 'auto' : `${Math.round(drawerWidth) + 8}px`

  const drawerNode = (
    <div
      className={cn(
        'fixed bg-transparent z-50',
        closeOnBackdrop ? 'start-0' : '',
        containerClassName
      )}
      style={{
        top: resolvedTopOffset,
        bottom: '0px',
        insetInlineEnd: rightSidebarOffset,
        inlineSize: containerInlineSize,
      }}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="presentation"
    >
      <div
        ref={panelRef}
        className={cn(
          'absolute top-0 bottom-0 end-0 bg-[var(--surface)]',
          'shadow-lg overflow-y-auto overflow-x-hidden',
          'dark:bg-[var(--surface)]',
          'transition-transform duration-300',
          className
        )}
        style={{
          inlineSize: `${Math.round(drawerWidth)}px`,
          maxInlineSize: 'calc(100vw - 1rem)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={drawerId}
        aria-describedby={descriptionId}
      >
        {resizable ? (
          <button
            type="button"
            onMouseDown={handleResizeStart}
            className="absolute inset-y-0 -start-1 z-10 w-2 cursor-ew-resize bg-transparent"
            aria-label="Resize drawer"
            title="Resize drawer"
          />
        ) : null}

        <div className="flex min-w-0 items-center justify-between p-4 border-b border-[var(--border)] sticky top-0 bg-[var(--surface)]">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 id={drawerId} className="font-bold font-arabic text-lg text-[var(--text)]">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-[var(--text-light)] font-arabic mt-1">
                {description}
              </p>
            )}
          </div>
          <span className="ms-2 hidden shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)] sm:inline">
            Esc
          </span>
          {headerActions ? (
            <div className="ms-2 flex shrink-0 items-center gap-1">
              {headerActions}
            </div>
          ) : null}
          <button
            onClick={onClose}
            title="Close - Esc"
            className={cn(
              'p-1 hover:bg-[var(--surface-2)] rounded-lg',
              'transition-colors focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[#00C2CB] ms-2 flex-shrink-0'
            )}
            aria-label="إغلاق"
          >
            <X size={20} className="text-[var(--text)]" />
          </button>
        </div>

        <div className="min-w-0 overflow-x-hidden p-4">
          {children}
        </div>
      </div>
    </div>
  )

  if (portal && typeof document !== 'undefined') {
    return createPortal(drawerNode, document.body)
  }

  return drawerNode
}
