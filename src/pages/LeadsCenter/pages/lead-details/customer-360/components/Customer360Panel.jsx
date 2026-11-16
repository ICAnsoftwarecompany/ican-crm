export function Customer360Panel({ title, description, children, className = '' }) {
  return (
    <section className={`min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${className}`}>
      {(title || description) && (
        <header className="mb-3 border-b border-slate-100 pb-2">
          {title && <h2 className="text-sm font-bold leading-5 text-slate-900">{title}</h2>}
          {description && <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
