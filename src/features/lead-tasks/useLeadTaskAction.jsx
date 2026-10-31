import { useCallback, useState } from 'react'
import { LeadTaskDialog } from './LeadTaskDialog'
import { leadTaskTargets } from './leadTaskModel'

export function useLeadTaskAction({ dealId, onSaved } = {}) {
  const [targets, setTargets] = useState(null)
  const open = useCallback((records) => {
    const rows = Array.isArray(records) ? records : [records]
    setTargets({ rows: leadTaskTargets(rows, dealId), invalidCount: rows.filter((row) => !leadTaskTargets([row], dealId).length).length })
  }, [dealId])
  return { open, dialog: targets && <LeadTaskDialog targets={targets.rows} invalidCount={targets.invalidCount} onClose={() => setTargets(null)} onSaved={onSaved} /> }
}
