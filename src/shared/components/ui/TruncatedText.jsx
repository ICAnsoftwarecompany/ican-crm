import { useRef, useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { cn } from '../../utils/cn'

const LINE_CLAMP = {
  1: 'truncate',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
}

function isOverflowing(node) {
  if (!node) return false
  return node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1
}

/**
 * Text cut to 1–3 lines. Hovering (or focusing) it shows the full text in a popover,
 * but only when the text is actually cut.
 */
export function TruncatedText({ text, lines = 1, className, contentClassName, dir, as: Component = 'span', delay = 250 }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const value = text === null || text === undefined ? '' : String(text)
  if (!value) return null

  return (
    <Tooltip.Provider delayDuration={delay} skipDelayDuration={100}>
      <Tooltip.Root open={open} onOpenChange={(next) => setOpen(next && isOverflowing(ref.current))}>
        <Tooltip.Trigger asChild>
          <Component ref={ref} dir={dir} className={cn('block min-w-0 break-words', LINE_CLAMP[lines] || LINE_CLAMP[1], className)}>
            {value}
          </Component>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="start"
            sideOffset={6}
            collisionPadding={12}
            className={cn(
              'z-[60] max-h-72 max-w-sm overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs leading-5 text-[var(--text)] shadow-lg',
              contentClassName
            )}
            dir={dir}
          >
            {value}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
