export function CampaignPageHeading({ title, description, actions }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-xl font-bold text-[var(--text)]">{title}</h2>{description && <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
