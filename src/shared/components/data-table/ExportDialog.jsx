import { Button } from '../ui/Button'
import { AppModal } from '../overlays/AppModal'

export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  exportOptions,
  onExportModeChange,
  onColumnModeChange,
  hasFilteredData = true,
}) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="تصدير البيانات"
      size="md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="button" variant="primary" onClick={() => onExport()}>
            تصدير
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-bold mb-2 font-arabic">تصدير</h3>
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
              <span className="font-arabic">النتائج المصفاة الحالية</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exportMode"
                value="all"
                checked={exportOptions.exportMode === 'all'}
                onChange={(e) => onExportModeChange(e.target.value)}
              />
              <span className="font-arabic">جميع البيانات</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-2 font-arabic">الأعمدة</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.columnMode === 'visible'}
                onChange={(e) =>
                  onColumnModeChange(e.target.checked ? 'visible' : 'all')
                }
              />
              <span className="font-arabic">الأعمدة المرئية فقط</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.columnMode === 'all'}
                onChange={(e) =>
                  onColumnModeChange(e.target.checked ? 'all' : 'visible')
                }
              />
              <span className="font-arabic">جميع الأعمدة</span>
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-500 font-arabic">
          {exportOptions.exportMode === 'filtered'
            ? 'سيتم تصدير البيانات المصفاة الحالية فقط'
            : 'سيتم تصدير جميع البيانات'}
        </p>
      </div>
    </AppModal>
  )
}
