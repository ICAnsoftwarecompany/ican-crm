import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileSpreadsheet, Plus, Upload } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { newRowKey, parseLeadText } from '../../../utils/leadSource'
import { LEAD_FILE_ACCEPT, readLeadFile } from '../../../utils/readLeadFile'
import { FieldLabel, dealInputClass } from '../../common/FieldLabel'

const EMPTY = { name: '', phone: '', email: '' }

/**
 * New leads for the basket, three ways: type one (Enter adds it), paste a block copied from Excel / Sheets, or pick
 * an .xlsx / .csv file (read in the browser). `room` = how many more rows fit; extra rows are cut and reported.
 */
export function NewLeadsInput({ way, onAdd, room }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY)
  const [text, setText] = useState('')
  const [message, setMessage] = useState(null)
  const [reading, setReading] = useState(false)
  const nameRef = useRef(null)

  const take = (rows) => {
    if (!rows.length) {
      setMessage({ tone: 'error', text: t('dealWorkspace.wizard.source.leads.nothingFound') })
      return false
    }
    const kept = rows.slice(0, Math.max(room, 0))
    onAdd(kept)
    setMessage({ tone: kept.length < rows.length ? 'error' : 'ok', text: kept.length < rows.length ? t('dealWorkspace.wizard.source.leads.cut', { added: kept.length, total: rows.length }) : t('dealWorkspace.wizard.source.leads.added', { count: kept.length }) })
    return kept.length > 0
  }

  const addOne = () => {
    if (!form.name.trim() && !form.phone.trim()) return
    if (take([{ key: newRowKey(), ...form, company: '' }])) {
      setForm(EMPTY)
      nameRef.current?.focus()
    }
  }
  const onEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addOne()
    }
  }
  const readFile = async (file) => {
    if (!file) return
    setReading(true)
    try {
      take(await readLeadFile(file))
    } catch {
      setMessage({ tone: 'error', text: t('dealWorkspace.wizard.source.leads.fileFailed') })
    } finally {
      setReading(false)
    }
  }

  return (
    <div className="space-y-3">
      {way === 'type' && (
        <>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <FieldLabel label={t('dealWorkspace.fields.name')}><input ref={nameRef} className={dealInputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} onKeyDown={onEnter} /></FieldLabel>
            <FieldLabel label={t('dealWorkspace.fields.phone')}><input dir="ltr" className={dealInputClass} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} onKeyDown={onEnter} /></FieldLabel>
          </div>
          <FieldLabel label={t('dealWorkspace.wizard.source.leads.emailOptional')}><input dir="ltr" type="email" className={dealInputClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} onKeyDown={onEnter} /></FieldLabel>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.leads.enterHint')}</span>
            <Button size="sm" onClick={addOne} disabled={room <= 0}><Plus size={14} />{t('dealWorkspace.wizard.source.leads.addOne')}</Button>
          </div>
        </>
      )}

      {way === 'paste' && (
        <>
          <FieldLabel label={t('dealWorkspace.wizard.source.leads.pasteLabel')} hint={t('dealWorkspace.wizard.source.leads.pasteHint')}>
            <textarea dir="auto" className={`${dealInputClass} h-36 py-2 font-mono text-xs`} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('dealWorkspace.wizard.source.leads.pastePlaceholder')} />
          </FieldLabel>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { if (take(parseLeadText(text))) setText('') }} disabled={!text.trim() || room <= 0}>{t('dealWorkspace.wizard.source.leads.readPaste')}</Button>
          </div>
        </>
      )}

      {way === 'file' && (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] p-6 text-center hover:border-[var(--brand-accent)]">
          <FileSpreadsheet size={26} className="text-[var(--brand-accent)]" />
          <span className="text-sm font-semibold text-[var(--text)]">{reading ? t('dealWorkspace.common.loading') : t('dealWorkspace.wizard.source.leads.fileLabel')}</span>
          <span className="text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.leads.fileHint')}</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)]"><Upload size={13} />{t('dealWorkspace.wizard.source.leads.fileButton')}</span>
          <input type="file" accept={LEAD_FILE_ACCEPT} className="sr-only" disabled={reading || room <= 0} aria-label={t('dealWorkspace.wizard.source.leads.fileLabel')} onChange={(event) => { readFile(event.target.files?.[0]); event.target.value = '' }} />
        </label>
      )}

      {room <= 0 && <p className="text-xs text-red-600 dark:text-red-400">{t('dealWorkspace.wizard.errors.tooManyLeads')}</p>}
      {message && <p role="status" className={message.tone === 'error' ? 'text-xs text-red-600 dark:text-red-400' : 'text-xs text-emerald-700 dark:text-emerald-300'}>{message.text}</p>}
    </div>
  )
}
