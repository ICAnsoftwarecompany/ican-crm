import { CustomersPageShortcuts } from '../CustomersPageShortcuts'
import { LeadsActionsMenu } from './LeadsActionsMenu'
import { TableSettingsAction } from './TableSettingsAction'
import { TrashLeadsAction } from './TrashLeadsAction'

export function CustomersPageActions({
  onAdd,
  onImport,
  onExport,
  onTrash,
  trashActive = false,
  onTableSettings,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CustomersPageShortcuts />
      <TableSettingsAction onClick={onTableSettings} />
      <LeadsActionsMenu onAdd={onAdd} onImport={onImport} onExport={onExport} />
      <TrashLeadsAction active={trashActive} onClick={onTrash} />
    </div>
  )
}
