// Generalizes the card-select pattern already used inline in
// pages/outreach-campaigns/components/wizard/steps/CampaignChannelStep.jsx
// into a reusable local component for this wizard.
export function CardOption({ icon: Icon, title, description, selected, onSelect, onFocusGuide, onBlurGuide }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onFocus={onFocusGuide}
      onBlur={onBlurGuide}
      onMouseEnter={onFocusGuide}
      onMouseLeave={onBlurGuide}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-start transition-colors ${
        selected ? 'border-[#00C2CB] bg-[#E8F9FA]' : 'border-[var(--border)] bg-[var(--surface)] hover:border-[#00C2CB]/50'
      }`}
    >
      {Icon && (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
          <Icon size={20} />
        </span>
      )}
      <div>
        <h4 className="text-sm font-black text-[var(--text)]">{title}</h4>
        {description && <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>}
      </div>
    </button>
  )
}
