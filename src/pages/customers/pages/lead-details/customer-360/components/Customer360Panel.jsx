export function Customer360Panel({ title, description, children, className = '' }) {
  return <section className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
    {(title || description) && <header className="mb-4"><h2 className="text-base font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</header>}
    {children}
  </section>
}
