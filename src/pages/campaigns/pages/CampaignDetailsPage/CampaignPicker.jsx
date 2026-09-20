import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Badge } from '../../../../shared/components/ui/Badge'
import { displayValue } from '../../../../shared/utils/apiResponse'
import { formatCurrencyValue } from '../../utils/campaignFormatters'
import { LatinValue } from './LatinValue'

export function CampaignPicker({ t, i18n, campaigns, activeCampaignId, onSelect }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeCampaign = campaigns.find((campaign) => String(campaign.id) === String(activeCampaignId))

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text)] sm:w-auto sm:min-w-72"
      >
        <span className="truncate">{displayValue(activeCampaign?.name, t('campaigns.details.selectCampaign'))}</span>
        <ChevronDown size={16} className="shrink-0 text-[var(--text-muted)]" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-80 w-full min-w-72 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-lg sm:w-[28rem]">
          {campaigns.map((campaign) => (
            <button
              type="button"
              key={campaign.id}
              onClick={() => { onSelect(campaign.id); setOpen(false) }}
              className={`flex w-full flex-col gap-1 border-b border-[var(--border)] px-3 py-2 text-start last:border-b-0 hover:bg-[var(--surface-2)] ${String(campaign.id) === String(activeCampaignId) ? 'bg-[var(--brand-bg)]' : ''}`}
            >
              <span className="truncate text-sm font-bold text-[var(--text)]">{displayValue(campaign.name)}</span>
              <span className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Badge variant={String(campaign.status).toLowerCase() === 'active' ? 'success' : 'default'}>{displayValue(campaign.status)}</Badge>
                {campaign.effective_status && campaign.effective_status !== campaign.status && <Badge variant="default">{displayValue(campaign.effective_status)}</Badge>}
                <span>{displayValue(campaign.objective)}</span>
                {(campaign.daily_budget || campaign.lifetime_budget) && (
                  <LatinValue>{formatCurrencyValue(campaign.daily_budget ?? campaign.lifetime_budget, campaign.account_currency, i18n.language)}</LatinValue>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
