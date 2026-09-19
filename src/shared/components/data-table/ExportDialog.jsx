import { Button } from '../ui/Button'
import { AppModal } from '../overlays/AppModal'
import { useTranslation } from 'react-i18next'

export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  exportOptions,
  onExportModeChange,
  onColumnModeChange,
  hasFilteredData = true,
}) {
  const { t } = useTranslation()
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dataTable.export.title')}
      size="md"
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} className="justify-center">
            {t('actions.cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={() => onExport()} className="justify-center">
            {t('actions.export')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-bold mb-2 font-arabic">{t('dataTable.export.scope')}</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exportMode"
                value="filtered"
                checked={exportOptions.exportMode === 'filtered'}
                onChange={(e) => onExportModeChange(e.target.value)}
                disabled={!hasFilteredData}
              />
              <span className="font-arabic">{t('dataTable.export.filtered')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exportMode"
                value="all"
                checked={exportOptions.exportMode === 'all'}
                onChange={(e) => onExportModeChange(e.target.value)}
              />
              <span className="font-arabic">{t('dataTable.export.allData')}</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-2 font-arabic">{t('dataTable.export.columns')}</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.columnMode === 'visible'}
                onChange={(e) =>
                  onColumnModeChange(e.target.checked ? 'visible' : 'all')
                }
              />
              <span className="font-arabic">{t('dataTable.export.visibleColumns')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.columnMode === 'all'}
                onChange={(e) =>
                  onColumnModeChange(e.target.checked ? 'all' : 'visible')
                }
              />
              <span className="font-arabic">{t('dataTable.export.allColumns')}</span>
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-500 font-arabic">
          {t(exportOptions.exportMode === 'filtered' ? 'dataTable.export.filteredNotice' : 'dataTable.export.allNotice')}
        </p>
      </div>
    </AppModal>
  )
}
