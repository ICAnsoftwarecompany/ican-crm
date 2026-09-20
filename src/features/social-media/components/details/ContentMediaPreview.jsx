import { useState } from 'react'
import { ImageOff, PlayCircle } from 'lucide-react'

/** Shared media renderer — image / video / carousel / unknown, never a broken-image icon (see docs "Media Handling"). */
export function ContentMediaPreview({ content }) {
  const [failedIndex, setFailedIndex] = useState(new Set())
  const media = content.media?.length ? content.media : content.thumbnail ? [{ url: content.thumbnail, type: content.mediaType === 'video' ? 'video' : 'image' }] : []

  if (media.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-light)]">
        <ImageOff size={32} />
      </div>
    )
  }

  return (
    <div className={`grid gap-2 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {media.map((item, index) => {
        const failed = failedIndex.has(index) || !item.url
        return (
          <div key={index} className="relative aspect-video overflow-hidden rounded-lg bg-[var(--surface-2)]">
            {failed ? (
              <div className="flex h-full w-full items-center justify-center text-[var(--text-light)]">
                {item.type === 'video' ? <PlayCircle size={28} /> : <ImageOff size={28} />}
              </div>
            ) : (
              <img
                src={item.url}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setFailedIndex((current) => new Set(current).add(index))}
              />
            )}
            {item.type === 'video' && !failed && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                <PlayCircle size={36} className="text-white" />
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
