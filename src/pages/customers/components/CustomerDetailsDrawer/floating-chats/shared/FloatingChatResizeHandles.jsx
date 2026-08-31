const HANDLES = [
  { direction: 'n', className: 'left-3 right-3 top-0 h-2 cursor-ns-resize' },
  { direction: 's', className: 'bottom-0 left-3 right-3 h-2 cursor-ns-resize' },
  { direction: 'e', className: 'bottom-3 right-0 top-3 w-2 cursor-ew-resize' },
  { direction: 'w', className: 'bottom-3 left-0 top-3 w-2 cursor-ew-resize' },
  { direction: 'ne', className: 'right-0 top-0 h-4 w-4 cursor-nesw-resize' },
  { direction: 'nw', className: 'left-0 top-0 h-4 w-4 cursor-nwse-resize' },
  { direction: 'se', className: 'bottom-0 right-0 h-4 w-4 cursor-nwse-resize' },
  { direction: 'sw', className: 'bottom-0 left-0 h-4 w-4 cursor-nesw-resize' },
]

export function FloatingChatResizeHandles({ disabled, onResizeStart }) {
  if (disabled) return null

  return (
    <>
      {HANDLES.map((handle) => (
        <div
          key={handle.direction}
          data-resize-handle="true"
          className={`absolute z-20 opacity-0 transition-opacity hover:bg-[#00C2CB]/20 hover:opacity-100 ${handle.className}`}
          onPointerDown={(event) => onResizeStart(handle.direction, event)}
          aria-hidden="true"
        />
      ))}
    </>
  )
}
