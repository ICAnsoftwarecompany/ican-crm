import { RelationRowsEditor } from '../../components/common/RelationRowsEditor'

/** Step 4: items sold with this one (included / optional); pre-filled from the item type's default attached items. */
export function RelationsStep({ wizard }) {
  return <RelationRowsEditor rows={wizard.relations} errors={wizard.stepErrors} onChange={wizard.setRelations} />
}
