import { cn } from '../../utils/cn'

export function PipelineCard({ children, className, ...props }) {
  return (
    <article
      className={cn(
        'cursor-grab rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--text)] shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        className
      )}
      {...props}
    >
      {children}
    </article>
  )
}
