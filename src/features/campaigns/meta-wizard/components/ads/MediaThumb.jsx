import { Film, ImageIcon } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'

/** Thumbnail for library media (gradient in demo mode, URL in live mode, object URL for local uploads). */
export function MediaThumb({ media, className, showType = true }) {
  if (!media) {
    return <div className={cn('flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-light)]', className)}><ImageIcon size={22} /></div>
  }
  const style = media.url
    ? { backgroundImage: `url("${media.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundImage: `linear-gradient(135deg, ${media.gradient?.[0] || 'var(--surface-2)'}, ${media.gradient?.[1] || 'var(--border)'})` }
  return (
    <div className={cn('relative overflow-hidden', className)} style={style} role="img" aria-label={media.name}>
      {showType && media.type === 'video' && (
        <span className="absolute bottom-1.5 start-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white" dir="ltr">
          <Film size={10} />
          {media.durationSeconds ? `0:${String(media.durationSeconds).padStart(2, '0')}` : ''}
        </span>
      )}
    </div>
  )
}
