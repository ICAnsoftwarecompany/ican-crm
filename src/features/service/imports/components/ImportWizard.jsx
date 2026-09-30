import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Download, FileUp, Play, RotateCcw } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Select } from '../../../../shared/components/ui/Select'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { downloadErrorFile, useImportEntities, useImportFields, useImportMappings, useImportMutations } from '../api/importsApi'
import { suggestMapping } from '../utils/suggestMapping'
import { ImportMappingStep } from './ImportMappingStep'

const STEPS = ['source', 'mapping', 'review', 'done']
const MAX_BYTES = 5 * 1024 * 1024

/** Import wizard: what + file → mapping → dry run review → execute → result with error file. */
export function ImportWizard() {
  const { t, i18n } = useTranslation()
  const input = useRef(null)
  const entities = useImportEntities()
  const { upload, dryRun, execute } = useImportMutations()
  const [target, setTarget] = useState('')
  const [file, setFile] = useState(null)
  const [mapping, setMapping] = useState({})
  const [mode, setMode] = useState('create')
  const [matchKey, setMatchKey] = useState('')
  const [mappingName, setMappingName] = useState('')
  const [job, setJob] = useState(null)
  const [step, setStep] = useState('source')
  const [entityType, scopeId] = target.split(':')
  const params = entityType ? { entity_type: entityType, scope_id: scopeId || undefined } : null
  const fields = useImportFields(params)
  const saved = useImportMappings(params)
  const entityLabel = (entry) => (entry.entity_type === 'asset' ? t('service.imports.entities.asset') : localizeLabel(entry.label, i18n.language, entry.scope_id))
  const fieldName = (key) => {
    const field = (fields.data || []).find((entry) => entry.key === key)
    return field?.label ? localizeLabel(field.label, i18n.language, key) : t(`service.imports.fields.${key}`, { defaultValue: key })
  }
  const labelsOf = useMemo(() => (field) => (field.label ? [field.label.ar, field.label.en] : [t(`service.imports.fields.${field.key}`)]), [t])

  const reset = () => {
    setFile(null)
    setJob(null)
    setMapping({})
    setMappingName('')
    setStep('source')
    ;[upload, dryRun, execute].forEach((mutation) => mutation.reset())
  }
  const pickFile = async (picked) => {
    if (!picked) return
    if (picked.size > MAX_BYTES) return toast.error(t('service.imports.tooLarge'))
    const content = await picked.text()
    upload.mutate({ fileName: picked.name, content }, {
      onSuccess: (uploaded) => {
        setFile(uploaded)
        setMapping(suggestMapping(uploaded.headers, fields.data || [], labelsOf))
        setMatchKey((fields.data || []).find((field) => field.matchable)?.key || '')
        setStep('mapping')
      },
    })
  }
  const runDry = () => dryRun.mutate({ file_id: file.file_id, entity_type: entityType, scope_id: scopeId || undefined, mode, match_key: matchKey || undefined, mapping, save_mapping_as: mappingName || undefined }, { onSuccess: (result) => { setJob(result); setStep('review') } })
  const uploadError = upload.error?.response?.data?.errors?.file?.[0]

  return (
    <div className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <ol className="flex flex-wrap gap-2 text-xs">
        {STEPS.map((key, index) => (
          <li key={key} className={cn('rounded-full px-3 py-1', step === key ? 'bg-brand-accent font-semibold text-white' : STEPS.indexOf(step) > index ? 'bg-[var(--surface-2)] text-[var(--text)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]')}>
            {index + 1}. {t(`service.imports.steps.${key}`)}
          </li>
        ))}
      </ol>

      {step === 'source' && (
        <div className="grid gap-3 sm:max-w-md">
          <Select label={t('service.imports.what')} value={target} onChange={(value) => { setTarget(value || ''); setFile(null) }} placeholder={t('service.imports.chooseWhat')} options={(entities.data || []).map((entry) => ({ value: `${entry.entity_type}:${entry.scope_id || ''}`, label: entityLabel(entry) }))} />
          <input ref={input} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { pickFile(event.target.files?.[0]); event.target.value = '' }} />
          <Button className="w-fit" disabled={!target || fields.isLoading} loading={upload.isPending} onClick={() => input.current?.click()}><FileUp size={16} aria-hidden="true" />{t('service.imports.chooseFile')}</Button>
          {uploadError && <p className="text-xs text-sla-breached">{t(`service.imports.fileErrors.${uploadError}`, { defaultValue: t('service.imports.fileErrors.invalid') })}</p>}
          <p className="text-xs text-[var(--text-muted)]">{t('service.imports.fileHint')}</p>
        </div>
      )}

      {step === 'mapping' && file && (
        <>
          <p className="text-sm text-[var(--text-muted)]">{t('service.imports.fileSummary', { name: file.file_name, count: file.row_count })}</p>
          <ImportMappingStep file={file} fields={fields.data || []} mapping={mapping} onMapping={setMapping} mode={mode} onMode={setMode} matchKey={matchKey} onMatchKey={setMatchKey} mappingName={mappingName} onMappingName={setMappingName} savedMappings={saved.data || []} onApplySaved={(entry) => { if (!entry) return; setMapping(Object.fromEntries(file.headers.map((header) => [header, entry.columns?.[header] || '']))); setMode(entry.mode || 'create'); setMatchKey(entry.match_key || '') }} />
          {dryRun.error?.response?.data?.errors?.match_key && <p className="text-xs text-sla-breached">{t('service.imports.matchKeyRequired')}</p>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}><RotateCcw size={16} aria-hidden="true" />{t('service.imports.startOver')}</Button>
            <Button loading={dryRun.isPending} onClick={runDry}>{t('service.imports.dryRun')}</Button>
          </div>
        </>
      )}

      {(step === 'review' || step === 'done') && job && (
        <div className="grid gap-3">
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(step === 'done' ? ['total', 'succeeded', 'failed'] : ['total', 'valid', 'failed', 'to_create', 'to_update']).map((key) => (
              <div key={key} className="rounded-lg bg-[var(--surface-2)] p-3">
                <dt className="text-xs text-[var(--text-muted)]">{t(`service.imports.counts.${key}`)}</dt>
                <dd className={cn('text-lg font-bold', key === 'failed' && job[key] > 0 && 'text-sla-breached')}>{job[key]}</dd>
              </div>
            ))}
          </dl>
          {job.errors_preview?.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--border)]">
              <ul className="divide-y divide-[var(--border)] text-sm">
                {job.errors_preview.map((entry) => (
                  <li key={entry.row} className="px-3 py-1.5">
                    <span className="font-medium">{t('service.imports.row', { row: entry.row })}</span>
                    <span className="text-[var(--text-muted)]"> · {entry.errors.map((error) => t(`service.imports.errorCodes.${error.code}`, { field: fieldName(error.field) })).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {step === 'done' && <p className="text-sm text-sla-on-track">{t('service.imports.doneText', { count: job.succeeded })}</p>}
          <div className="flex flex-wrap gap-2">
            {job.failed > 0 && <Button variant="outline" onClick={() => downloadErrorFile(job.id).catch(() => toast.error(t('service.errors.generic')))}><Download size={16} aria-hidden="true" />{t('service.imports.errorFile')}</Button>}
            {step === 'review' && <Button variant="outline" onClick={() => setStep('mapping')}>{t('service.imports.backToMapping')}</Button>}
            {step === 'review' && <Button disabled={!job.valid} loading={execute.isPending} onClick={() => execute.mutate(job.id, { onSuccess: (result) => { setJob(result); setStep('done'); toast.success(t('service.imports.done', { count: result.succeeded })) } })}><Play size={16} aria-hidden="true" />{t('service.imports.execute', { count: job.valid })}</Button>}
            {step === 'done' && <Button onClick={reset}>{t('service.imports.another')}</Button>}
          </div>
        </div>
      )}
    </div>
  )
}
