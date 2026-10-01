import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { useDirection } from '../../../shared/hooks/useDirection'
import { SHOWCASE_INTERVAL_MS, SHOWCASE_SLIDES } from '../constants/showcaseSlides'

const SWIPE_THRESHOLD_PX = 48

/**
 * Auto-playing slider on the login page that walks through the main areas
 * of the system. Controlled: the page owns `showcase` (useShowcase) so the
 * background can follow the active slide.
 */
export function LoginShowcase({ showcase, className }) {
  const { t } = useTranslation()
  const dir = useDirection()
  const pointerStart = useRef(null)
  const { index, goTo, next, prev, paused, userPaused, togglePaused, pauseHandlers } = showcase

  const slide = SHOWCASE_SLIDES[index]
  const SlideIcon = slide.icon
  const base = `auth.showcase.slides.${slide.id}`
  const total = SHOWCASE_SLIDES.length

  // Visual direction: "next" is toward the end of the reading direction.
  const isRtl = dir === 'rtl'
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (isRtl) prev()
      else next()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (isRtl) next()
      else prev()
    }
  }

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') return
    pointerStart.current = event.clientX
  }

  const handlePointerUp = (event) => {
    if (pointerStart.current === null) return
    const delta = event.clientX - pointerStart.current
    pointerStart.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    const towardEnd = isRtl ? delta > 0 : delta < 0
    if (towardEnd) next()
    else prev()
  }

  return (
    <section
      aria-roledescription={t('auth.showcase.roledescription')}
      aria-label={t('auth.showcase.label')}
      className={cn('flex flex-col', className)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...pauseHandlers}
    >
      {/* Slide — re-keyed so every change replays the staggered entrance. */}
      <div
        key={slide.id}
        role="group"
        aria-roledescription={t('auth.showcase.slideRoledescription')}
        aria-label={t('auth.showcase.slideOf', { index: index + 1, total })}
        aria-live={userPaused ? 'polite' : 'off'}
        className="showcase-slide min-h-[25rem] sm:min-h-[23rem]"
      >
        <span
          className="showcase-stagger inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--brand-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] py-1 pe-3 ps-1 text-sm font-bold text-[var(--text)] backdrop-blur-md"
          style={{ '--stagger': 0 }}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent text-[var(--brand-primary)]">
            <SlideIcon size={15} strokeWidth={2} />
          </span>
          {t(`${base}.area`)}
        </span>

        <h1
          className="showcase-stagger mt-5 max-w-[18ch] text-[32px] font-black leading-[1.15] tracking-tight sm:text-[44px] xl:text-[52px]"
          style={{ '--stagger': 1 }}
        >
          {t(`${base}.title`)}
        </h1>

        <p
          className="showcase-stagger mt-4 max-w-[52ch] text-base font-medium leading-relaxed text-[var(--text-muted)] sm:text-[17px]"
          style={{ '--stagger': 2 }}
        >
          {t(`${base}.subtitle`)}
        </p>

        <ul className="mt-7 grid max-w-[40rem] gap-3 sm:grid-cols-2">
          {slide.points.map(({ id, icon: PointIcon }, pointIndex) => (
            <li
              key={id}
              className="showcase-stagger flex items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--surface)_55%,transparent)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-3.5 backdrop-blur-md"
              style={{ '--stagger': 3 + pointIndex }}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--ai-bg)] text-[var(--ai-text)]">
                <PointIcon size={16} strokeWidth={1.9} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black text-[var(--text)]">{t(`${base}.points.${id}.title`)}</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-[var(--text-muted)]">
                  {t(`${base}.points.${id}.text`)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center gap-1.5" role="tablist" aria-label={t('auth.showcase.chooseSlide')}>
          {SHOWCASE_SLIDES.map((item, dotIndex) => {
            const active = dotIndex === index
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${t(`auth.showcase.slides.${item.id}.area`)} · ${t('auth.showcase.slideOf', { index: dotIndex + 1, total })}`}
                onClick={() => goTo(dotIndex)}
                className={cn(
                  'relative h-2 overflow-hidden rounded-full transition-[width,background-color] duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-bg)]',
                  active
                    ? 'w-10 bg-[color-mix(in_srgb,var(--text)_14%,transparent)]'
                    : 'w-2 bg-[color-mix(in_srgb,var(--text)_22%,transparent)] hover:bg-[color-mix(in_srgb,var(--text)_40%,transparent)]'
                )}
              >
                {active && (
                  <span
                    key={`${item.id}-${index}`}
                    className="showcase-progress absolute inset-y-0 start-0 rounded-full bg-brand-accent"
                    style={{
                      animationDuration: `${SHOWCASE_INTERVAL_MS}ms`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
                    onAnimationEnd={next}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="ms-auto flex items-center gap-1.5">
          <ControlButton label={t('auth.showcase.previous')} onClick={prev}>
            <PrevIcon size={16} />
          </ControlButton>
          <ControlButton
            label={userPaused ? t('auth.showcase.play') : t('auth.showcase.pause')}
            onClick={togglePaused}
            pressed={userPaused}
          >
            {userPaused ? <Play size={14} /> : <Pause size={14} />}
          </ControlButton>
          <ControlButton label={t('auth.showcase.next')} onClick={next}>
            <NextIcon size={16} />
          </ControlButton>
        </div>
      </div>
    </section>
  )
}

function ControlButton({ label, onClick, pressed, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] text-[var(--text)] backdrop-blur-md transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
    >
      {children}
    </button>
  )
}
