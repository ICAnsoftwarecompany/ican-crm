import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useProductInstanceMutations } from '../../hooks/useProductResources'
import { formatApiError } from '../../utils/apiErrors'
import { instanceLabel } from '../../utils/catalogNormalize'
import { ConfirmActionDialog, useConfirmAction } from '../common/ConfirmDelete'
import { EditInstanceDialog } from './EditInstanceDialog'

/** Edit / void / restore wiring for an instances table. Render `dialogs` next to the table. */
export function useInstanceActions() {
  const { t } = useTranslation()
  const mutations = useProductInstanceMutations()
  const [editing, setEditing] = useState(null)
  const voidAction = useConfirmAction({
    run: (instance) => mutations.void.mutateAsync(instance.id),
    successMessage: t('catalog.instances.voidedToast'),
    failureMessage: t('catalog.common.saveFailed'),
  })

  const restore = async (instance) => {
    try {
      await mutations.restore.mutateAsync(instance.id)
      toast.success(t('catalog.instances.restoredToast'))
    } catch (error) {
      toast.error(formatApiError(error, t('catalog.common.saveFailed')))
    }
  }

  const dialogs = (
    <>
      <EditInstanceDialog instance={editing} onClose={() => setEditing(null)} />
      <ConfirmActionDialog
        action={voidAction}
        type="warning"
        title={t('catalog.instances.voidTitle')}
        message={t('catalog.instances.voidMessage', { name: voidAction.target ? instanceLabel(voidAction.target) : '' })}
        confirmText={t('catalog.instances.void')}
      />
    </>
  )

  return { onEdit: setEditing, onVoid: voidAction.ask, onRestore: restore, dialogs }
}
