import { Paperclip } from 'lucide-react'

import { EmptyPanel } from '../CustomerDetailsTabPrimitives'
import { fieldValue } from '../customerDetailsUtils'

export function FilesTab({ customer, layoutMode = 'compact' }) {
  const files = Array.isArray(customer.files) ? customer.files : []

  return files.length ? (
    <div className={layoutMode === 'wide' ? 'grid min-w-0 grid-cols-2 gap-3 py-4' : 'min-w-0 space-y-3 py-4'}>
      {files.map((file, index) => (
        <div key={file.id || index} className="flex min-w-0 items-center gap-3 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3 shadow-sm">
          <Paperclip size={16} className="shrink-0 text-[#007A80]" />
          <span className="min-w-0 break-words text-sm font-semibold text-[var(--text)]">
            {fieldValue(file.name || file.path || file.url)}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <EmptyPanel title="Files" description="لا توجد ملفات مرفوعة لهذا العميل." />
  )
}
