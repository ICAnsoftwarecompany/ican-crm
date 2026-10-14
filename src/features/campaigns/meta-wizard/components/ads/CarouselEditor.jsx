import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useWizardField } from '../../context/MetaWizardContext'
import { CAROUSEL_LIMITS } from '../../config/metaCallToActions'
import { createId } from '../../state/initialWizardState'
import { IssueMessage } from '../fields'
import { inputClassName } from '../fields/FieldFrame'
import { MediaPicker } from './MediaPicker'

/** Carousel cards (2–10): media + headline + description + optional own link. */
export function CarouselEditor({ ad, path, showLinks, onChange }) {
  const { t } = useTranslation()
  const { issue } = useWizardField(path, 'ad.carousel')
  const cards = ad.carouselCards || []
  const setCards = (carouselCards) => onChange({ carouselCards })
  const updateCard = (id, patch) => setCards(cards.map((card) => (card.id === id ? { ...card, ...patch } : card)))
  const move = (index, delta) => {
    const next = [...cards]
    const [card] = next.splice(index, 1)
    next.splice(index + delta, 0, card)
    setCards(next)
  }

  return (
    <div className="grid gap-3" data-wizard-field={path}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.ads.carouselCards', { count: cards.length, max: CAROUSEL_LIMITS.max })}</span>
        {cards.length < CAROUSEL_LIMITS.max && (
          <button type="button" onClick={() => setCards([...cards, { id: createId('card'), media: null, headline: '', description: '', link: '' }])} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)]">
            <Plus size={13} />{t('campaignWizard.ads.addCard')}
          </button>
        )}
      </div>
      {issue && <IssueMessage issue={issue} />}
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, index) => (
          <div key={card.id} className="grid gap-2 rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text)]">{t('campaignWizard.ads.cardNumber', { count: index + 1 })}</span>
              <span className="flex gap-0.5">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label={t('campaignWizard.ads.moveUp')}><ArrowUp size={13} /></button>
                <button type="button" disabled={index === cards.length - 1} onClick={() => move(index, 1)} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label={t('campaignWizard.ads.moveDown')}><ArrowDown size={13} /></button>
                <button type="button" onClick={() => setCards(cards.filter((item) => item.id !== card.id))} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--notification-danger)]" aria-label={t('campaignWizard.common.remove')}><Trash2 size={13} /></button>
              </span>
            </div>
            <MediaPicker compact value={card.media} onChange={(media) => updateCard(card.id, { media })} path={`${path}.${card.id}`} />
            <input value={card.headline} onChange={(event) => updateCard(card.id, { headline: event.target.value })} placeholder={t('campaignWizard.ads.headline')} aria-label={t('campaignWizard.ads.headline')} className={inputClassName(false)} />
            <input value={card.description} onChange={(event) => updateCard(card.id, { description: event.target.value })} placeholder={t('campaignWizard.ads.description')} aria-label={t('campaignWizard.ads.description')} className={inputClassName(false)} />
            {showLinks && <input dir="ltr" type="url" value={card.link} onChange={(event) => updateCard(card.id, { link: event.target.value })} placeholder={t('campaignWizard.ads.cardLinkPlaceholder')} aria-label={t('campaignWizard.ads.cardLink')} className={inputClassName(false)} />}
          </div>
        ))}
      </div>
      {!cards.length && <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">{t('campaignWizard.ads.carouselEmpty', { min: CAROUSEL_LIMITS.min })}</p>}
    </div>
  )
}
