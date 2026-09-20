const STAGES = ['all', 'campaign', 'adset', 'ad']

export function StageNav({ t, activeStage, onSelect }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {STAGES.map((stage, index) => {
        const isActive = stage === activeStage
        return (
          <div key={stage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(stage)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                isActive
                  ? 'border-[#00C2CB] bg-[#00C2CB] text-white'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-latin ${isActive ? 'bg-white/20' : 'bg-[var(--surface-2)]'}`} dir="ltr">
                {index + 1}
              </span>
              {t(`campaigns.details.stages.${stage}`)}
            </button>
            {index < STAGES.length - 1 && <div className="h-px w-6 shrink-0 bg-[var(--border)]" />}
          </div>
        )
      })}
    </div>
  )
}
