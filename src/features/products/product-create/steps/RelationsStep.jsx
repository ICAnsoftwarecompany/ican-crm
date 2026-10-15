import { RelationRowsEditor } from '../../components/common/RelationRowsEditor'

/**
 * Step 4: items sold with this one (included / optional); pre-filled from the item type's default attached items.
 * A service attaches services only (2026-10-15).
 */
export function RelationsStep({ wizard, kind = 'product' }) {
  return <RelationRowsEditor rows={wizard.relations} errors={wizard.stepErrors} onChange={wizard.setRelations} onlyKind={kind === 'service' ? 'service' : null} />
}
