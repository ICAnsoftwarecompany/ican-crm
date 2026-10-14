import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Upload } from 'lucide-react'
import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../../shared/components/ui/Button'
import { cn } from '../../../../../shared/utils/cn'
import { useMetaWizard, useWizardField } from '../../context/MetaWizardContext'
import { useMediaLibrary } from '../../hooks/useWizardAssets'
import { WIZARD_PUBLISH_CAPABILITIES } from '../../config/wizardCapabilities'
import { DemoDataBadge, IssueMessage } from '../fields'
import { MediaThumb } from './MediaThumb'

/**
 * Picks one image/video from the ad account's library or a local file.
 * Local files preview immediately; they're uploaded at publish time once
 * the media upload endpoint exists (flagged in the UI until then).
 */
export function MediaPicker({ value, onChange, accept = 'all', path, label, compact }) {
  const { t } = useTranslation()
  const { tenantId, accountId } = useMetaWizard()
  const [open, setOpen] = useState(false)
  const fileRef = useRef(null)
  const { issue } = useWizardField(path || 'media', 'ad.media')
  const library = useMediaLibrary({ tenantId, accountId, enabled: open })
  const items = (library.data?.items || []).filter((item) => accept === 'all' || item.type === accept)

  const onFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const type = file.type.startsWith('video') ? 'video' : 'image'
    onChange({ id: `local-${Date.now()}`, type, name: file.name, url: URL.createObjectURL(file), local: true })
    event.target.value = ''
  }

  return (
    <div className="grid gap-2" data-wizard-field={path}>
      {label && <span className="text-sm font-medium text-[var(--text)]">{label}<span className="ms-1 text-[var(--notification-danger)]">*</span></span>}
      <div className={cn('flex gap-3', compact ? 'flex-col' : 'flex-wrap items-center')}>
        <MediaThumb media={value} className={cn('shrink-0 rounded-lg border border-[var(--border)]', compact ? 'aspect-square w-full' : 'h-24 w-24')} />
        <div className="grid gap-1.5">
          {value && <span className="max-w-[220px] truncate text-xs text-[var(--text-muted)]" dir="ltr">{value.name}</span>}
          {value?.local && !WIZARD_PUBLISH_CAPABILITIES.uploadMedia && <span className="text-[11px] text-[var(--notification-warning)]">{t('campaignWizard.ads.localUploadPending')}</span>}
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}><ImagePlus size={14} />{t('campaignWizard.ads.fromLibrary')}</Button>
            <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} />{t('campaignWizard.ads.upload')}</Button>
          </div>
          <input ref={fileRef} type="file" hidden accept={accept === 'video' ? 'video/*' : accept === 'image' ? 'image/*' : 'image/*,video/*'} onChange={onFile} />
        </div>
      </div>
      {issue && <IssueMessage issue={issue} />}

      <AppModal isOpen={open} onClose={() => setOpen(false)} size="lg" className="sm:max-w-3xl" title={t('campaignWizard.ads.libraryTitle')} description={t('campaignWizard.ads.libraryDescription')}>
        <div className="mb-3 flex justify-end"><DemoDataBadge show={library.data?.isMock} /></div>
        {library.isLoading && <p className="text-sm text-[var(--text-muted)]">{t('campaignWizard.common.loading')}</p>}
        {library.isError && <p className="text-sm text-[var(--notification-danger)]">{t('campaignWizard.common.loadError')}</p>}
        {!library.isLoading && !items.length && <p className="text-sm text-[var(--text-muted)]">{t('campaignWizard.ads.libraryEmpty')}</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => { onChange(item); setOpen(false) }} className={cn('overflow-hidden rounded-lg border text-start transition-shadow hover:shadow-md', value?.id === item.id ? 'border-[var(--brand-accent)] ring-2 ring-[var(--brand-accent)]' : 'border-[var(--border)]')}>
              <MediaThumb media={item} className="aspect-square w-full" />
              <span className="block truncate px-2 pt-1.5 text-xs font-semibold text-[var(--text)]" dir="ltr">{item.name}</span>
              <span className="block px-2 pb-1.5 text-[10px] text-[var(--text-muted)]" dir="ltr">{item.width}×{item.height}</span>
            </button>
          ))}
        </div>
      </AppModal>
    </div>
  )
}
