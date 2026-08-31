import { cn } from '../../utils/cn'

export function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-[var(--border)]', className)} />
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse p-4 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-6 w-1/4" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
