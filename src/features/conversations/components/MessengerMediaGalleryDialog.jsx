import { ChevronLeft, ChevronRight, ExternalLink, FileText, Music, X } from 'lucide-react'

export function MessengerMediaGalleryDialog({ open, items = [], activeIndex = 0, onIndexChange, onClose }) {
  if (!open || !items.length) return null

  const currentIndex = Math.max(0, Math.min(activeIndex, items.length - 1))
  const item = items[currentIndex]
  const canGoPrevious = items.length > 1
  const canGoNext = items.length > 1

  const goPrevious = () => {
    if (!canGoPrevious) return
    onIndexChange?.((currentIndex - 1 + items.length) % items.length)
  }

  const goNext = () => {
    if (!canGoNext) return
    onIndexChange?.((currentIndex + 1) % items.length)
  }

  return (
    <div className="fixed inset-0 z-[70000] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="flex h-[min(860px,92vh)] w-[min(1040px,96vw)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div className="min-w-0">
            <div className="truncate text-sm font-black">معرض الوسائط</div>
            <div className="text-xs font-semibold text-white/60">
              {currentIndex + 1} / {items.length}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            title="إغلاق"
          >
            <X size={18} />
          </button>
        </header>

        <div className="relative min-h-0 flex-1 bg-black">
          {item?.type === 'video' ? (
            <video src={item.url} controls autoPlay className="h-full w-full object-contain" />
          ) : item?.type === 'audio' ? (
            <div className="flex h-full w-full items-center justify-center p-6">
              <div className="w-[min(520px,90vw)] rounded-2xl border border-white/10 bg-white/10 p-5 text-center text-white shadow-2xl">
                <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
                  <Music size={30} />
                </span>
                <div className="mb-4 truncate text-sm font-black">{item.label || 'Voice note'}</div>
                <audio src={item.url} controls autoPlay className="h-10 w-full" />
              </div>
            </div>
          ) : item?.type === 'file' || item?.type === 'link' ? (
            <div className="flex h-full w-full items-center justify-center p-6">
              <div className="w-[min(520px,90vw)] rounded-2xl border border-white/10 bg-white/10 p-5 text-center text-white shadow-2xl">
                <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
                  <FileText size={30} />
                </span>
                <div className="mb-2 truncate text-sm font-black">{item.label || item.url || 'File'}</div>
                {item.sizeLabel ? <div className="mb-4 text-xs font-semibold text-white/60">{item.sizeLabel}</div> : null}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-slate-950 transition hover:bg-white/90"
                >
                  <ExternalLink size={15} />
                  فتح الملف
                </a>
              </div>
            </div>
          ) : (
            <img
              src={item.url}
              alt="Messenger media"
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          )}

          {items.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrevious}
                className="absolute start-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                title="السابق"
              >
                <ChevronRight size={22} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute end-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                title="التالي"
              >
                <ChevronLeft size={22} />
              </button>
            </>
          ) : null}
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-slate-900 px-3 py-3">
          {items.map((media, index) => (
            <button
              key={media.key}
              type="button"
              onClick={() => onIndexChange?.(index)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border transition ${
                index === currentIndex ? 'border-[#00C2CB] ring-2 ring-[#00C2CB]/40' : 'border-white/10 opacity-70 hover:opacity-100'
              }`}
              title={media.type}
            >
              {media.type === 'video' ? (
                <video src={media.url} className="h-full w-full object-cover" muted />
              ) : media.type === 'audio' ? (
                <span className="flex h-full w-full items-center justify-center bg-slate-800 text-white">
                  <Music size={22} />
                </span>
              ) : media.type === 'file' || media.type === 'link' ? (
                <span className="flex h-full w-full items-center justify-center bg-slate-800 text-white">
                  <FileText size={22} />
                </span>
              ) : (
                <img src={media.url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
