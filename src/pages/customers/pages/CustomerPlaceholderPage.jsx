import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Settings } from 'lucide-react'

export function CustomerPlaceholderPage({
  title,
  description,
  icon: Icon = Settings,
  actions,
  children,
}) {
  const cards = useMemo(
    () => [
      'استخدم نفس بيانات مركز العملاء المحتملين عند توصيل هذه الصفحة.',
      'المسار يعمل داخل تخطيط مركز العملاء المحتملين بدون تكرار القائمة الرئيسية.',
      'يمكن استبدال هذا المحتوى بمكوّن متخصص لاحقا.',
    ],
    []
  )

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
            <Icon size={19} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[var(--text)]">{title}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions}
          <Link
            to="/LeadsCenter"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E6F0] bg-transparent px-4 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[#F8FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB] dark:border-[#1E2D4A] dark:hover:bg-[#111827]"
          >
            <ArrowLeft size={16} />
            كل العملاء المحتملين
          </Link>
        </div>
      </header>

      {children || (
        <section className="grid gap-3 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--text-muted)]">
              {card}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
