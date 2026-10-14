import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { dealAiApi } from '../../api'
import { isDealApiLive } from '../../constants/dealApiStatus'
import { useDealContracts } from '../../hooks/useDealContracts'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { buildDealInsights } from '../../utils/dealInsights'
import { PlannedNotice } from '../common/PlannedNotice'
import { DealInsightsList } from '../overview/DealInsightsList'

const SUGGESTED = ['summary', 'nextActions', 'risks', 'followUp']

/**
 * Deal assistant. Today: rule-based hints from the deal's data (clearly labelled, not AI). The question box
 * calls the planned `POST /deals/{id}/ai/ask` — disabled until DEAL_API_STATUS.dealAi is live; the AI itself
 * always runs on the server.
 */
export function DealAssistant() {
  const { t } = useTranslation()
  const { dealId, deal, leads } = useDealWorkspace()
  const contractsQuery = useDealContracts({ deal_id: dealId })
  const insights = useMemo(() => buildDealInsights({ deal, leads, contracts: contractsQuery.contracts }), [contractsQuery.contracts, deal, leads])
  const live = isDealApiLive('dealAi')
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState([])
  const [asking, setAsking] = useState(false)

  const ask = async (text) => {
    const value = (text ?? question).trim()
    if (!value || !live) return
    setAsking(true)
    setHistory((current) => [...current, { role: 'user', content: value }])
    setQuestion('')
    try {
      const response = await dealAiApi.ask(dealId, { question: value, language: document.documentElement.lang || undefined })
      const answer = response?.data?.answer || response?.answer || ''
      setHistory((current) => [...current, { role: 'assistant', content: answer || t('dealWorkspace.assistant.noAnswer') }])
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.assistant.failed')))
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.assistant.hintsTitle')}</h2>
        <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.assistant.hintsNote')}</p>
        <DealInsightsList dealId={dealId} insights={insights} emptyText={t('dealWorkspace.overview.allGood')} />
      </section>

      <section className="space-y-3 rounded-lg border border-[var(--ai-border)] bg-[var(--ai-bg)] p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--ai-text)]"><Sparkles size={16} />{t('dealWorkspace.assistant.askTitle')}</h2>
        <PlannedNotice capability="dealAi" />
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((id) => (
            <Button key={id} size="sm" variant="ai" disabled={!live || asking} onClick={() => ask(t(`dealWorkspace.assistant.suggested.${id}`))}>{t(`dealWorkspace.assistant.suggested.${id}`)}</Button>
          ))}
        </div>
        {history.length > 0 && (
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {history.map((message, index) => (
              <p key={index} className={`whitespace-pre-line rounded-lg p-3 text-sm ${message.role === 'user' ? 'bg-[var(--surface)] text-[var(--text)]' : 'border border-[var(--ai-border)] bg-[var(--surface)] text-[var(--ai-text)]'}`}>{message.content}</p>
            ))}
          </div>
        )}
        <form onSubmit={(event) => { event.preventDefault(); ask() }} className="flex gap-2">
          <input
            className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--ai-border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none disabled:opacity-60"
            value={question}
            disabled={!live}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={t('dealWorkspace.assistant.placeholder')}
            aria-label={t('dealWorkspace.assistant.placeholder')}
          />
          <Button type="submit" variant="ai" size="icon" disabled={!live || asking || !question.trim()} aria-label={t('dealWorkspace.assistant.send')}><Send size={16} /></Button>
        </form>
      </section>
    </div>
  )
}
