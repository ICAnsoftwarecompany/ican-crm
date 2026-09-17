import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Paperclip, Upload, X } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'

/**
 * Campaign image attachments.
 *
 * The create endpoint's direct `files[]` support at creation time is not
 * documented with confidence (CodeA1_API_BackEndDocumentation.md notes a
 * commented-out hint only) — per the spec we always: create the campaign
 * first, obtain its id, THEN upload attachments via
 * `POST /campaigns/{campaign}/add/images`. So this component only ever
 * stages local `File` objects (mode="staged") until a campaign id exists;
 * the wizard uploads them right after a successful create. In edit mode
 * (mode="uploaded") it talks to the real add/remove endpoints directly.
 */
export function CampaignAttachments({
  mode = 'staged',
  stagedFiles = [],
  onAddStagedFiles,
  onRemoveStagedFile,
  uploadedAttachments = [],
  onUploadFiles,
  onRemoveUploadedAttachment,
  isUploading = false,
  isRemoving = false,
}) {
  const { t } = useTranslation()
  const inputRef = useRef(null)

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length) {
      if (mode === 'staged') onAddStagedFiles?.(files)
      else onUploadFiles?.(files)
    }
    event.target.value = ''
  }

  const items = mode === 'staged' ? stagedFiles : uploadedAttachments

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[var(--text)]">{t('outreachCampaigns.attachments.title')}</h4>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} loading={isUploading}>
          <Upload size={14} />
          {t('outreachCampaigns.attachments.upload')}
        </Button>
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFilesSelected} />
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">{t('outreachCampaigns.attachments.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((item, index) => {
            const isStaged = mode === 'staged'
            const key = isStaged ? `${item.name}-${index}` : (item.id ?? index)
            const previewUrl = isStaged ? URL.createObjectURL(item) : (item.url || item.path)
            const name = isStaged ? item.name : (item.name || item.filename || `#${item.id}`)

            return (
              <div key={key} className="group relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                {previewUrl ? (
                  <img src={previewUrl} alt={name} className="h-24 w-full object-cover" />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center text-[var(--text-muted)]">
                    <Paperclip size={20} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => (isStaged ? onRemoveStagedFile?.(index) : onRemoveUploadedAttachment?.(item.id))}
                  disabled={isRemoving}
                  className="absolute end-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={t('outreachCampaigns.attachments.remove')}
                >
                  <X size={12} />
                </button>
                <p className="truncate px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)]">{name}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
