import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '../../utils/cn'

/**
 * Thin wrapper around @radix-ui/react-dropdown-menu (an existing but,
 * until now, unused dependency) — the repo had no shared Popover/Menu
 * primitive; every prior "dropdown" (DataTable's context menu,
 * ColumnVisibilityToggle) was a bespoke, non-reusable implementation.
 * Kept prop-driven (not a compound component) so call sites stay simple.
 */
export function DropdownMenu({ trigger, items = [], align = 'start', contentClassName }) {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 min-w-[180px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg',
            contentClassName
          )}
        >
          {items.map((item, index) =>
            item.separator ? (
              <RadixDropdownMenu.Separator key={`sep-${index}`} className="my-1 h-px bg-[var(--border)]" />
            ) : (
              <RadixDropdownMenu.Item
                key={item.id || item.label}
                disabled={item.disabled}
                onSelect={() => item.onSelect?.()}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-[var(--text)] outline-none',
                  'data-[highlighted]:bg-[var(--surface-2)]',
                  item.disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {item.icon}
                {item.label}
              </RadixDropdownMenu.Item>
            )
          )}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  )
}
