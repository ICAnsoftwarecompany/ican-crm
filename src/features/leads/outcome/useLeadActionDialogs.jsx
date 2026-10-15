import { useState } from 'react'
import { LeadInterestDialog } from '../interests'
import { LeadLostDialog } from './components/LeadLostDialog'
import { LeadWonDialog } from './components/LeadWonDialog'

/**
 * One place for the Leads Center row actions that open a dialog (2026-10-15): add interest, won, lost.
 * `const actions = useLeadActionDialogs({ onDone })` → `actions.openInterest(row)`, `actions.openWon(row)`,
 * `actions.openLost(rows | row)`; render `actions.dialogs` once.
 */
export function useLeadActionDialogs({ onDone } = {}) {
  const [state, setState] = useState({ kind: null, rows: [] })
  const close = () => setState({ kind: null, rows: [] })
  const open = (kind) => (rows) => setState({ kind, rows: (Array.isArray(rows) ? rows : [rows]).filter(Boolean) })
  const first = state.rows[0] || null

  const dialogs = (
    <>
      <LeadInterestDialog open={state.kind === 'interest'} customer={first} onClose={close} onSaved={() => onDone?.()} />
      <LeadWonDialog open={state.kind === 'won'} customer={first} onClose={close} onDone={onDone} />
      <LeadLostDialog open={state.kind === 'lost'} customers={state.rows} onClose={close} onDone={onDone} />
    </>
  )

  return { openInterest: open('interest'), openWon: open('won'), openLost: open('lost'), dialogs }
}
