import { useEffect, useMemo, useState } from 'react'
import { Check, Eye, FileText, Hash, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { useMeetingInfo, useMeetingMutations } from '../../../meetings/hooks/useMeetings'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { getMeetingInfoPayload } from '../ScheduleDetails/scheduleDetailsUtils'
import {
  buildAfterMeetingReportText,
  createAfterMeetingEditableTemplate,
  createAfterMeetingInitialValues,
  hasAfterMeetingValues,
  validateAfterMeetingRequiredFields,
} from './afterMeetingReportHelpers'
import { getAfterMeetingTemplateById } from './afterMeetingTemplates'
import { AfterMeetingDynamicForm } from './AfterMeetingDynamicForm'
import { AfterMeetingTemplatePreview } from './AfterMeetingTemplatePreview'
import { AfterMeetingTemplateSelector } from './AfterMeetingTemplateSelector'

const FORM_ID = 'after-meeting-report-form'

function InlineEditableTitle({
  label,
  value,
  onSave,
  multiline = false,
  placeholder = '',
}) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(value || '')

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value || '')
    }
  }, [isEditing, value])

  const handleSave = () => {
    onSave?.(draftValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraftValue(value || '')
    setIsEditing(false)
  }

  return (
    <div className="space-y-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-black text-[#475569]">{label}</div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 rounded-md border border-[#BEEFF2] bg-white px-2 py-1 text-[11px] font-black text-[#007A80] hover:bg-[#F8FEFF]"
          >
            <Pencil size={12} />
            {t('actions.edit')}
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className="min-h-20 w-full resize-none rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-xs font-semibold leading-6 text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSave()
                }
              }}
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-white px-2 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
              placeholder={placeholder}
            />
          )}

          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] font-black text-[#64748B]"
            >
              <X size={12} />
              {t('actions.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1 rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-1 text-[11px] font-black text-[#166534]"
            >
              <Check size={12} />
              {t('actions.save')}
            </button>
          </div>
        </div>
      ) : (
        <div className="break-words text-xs font-bold text-[var(--text)]">{value || '-'}</div>
      )}
    </div>
  )
}

export function AfterMeetingReportDrawer({
  open,
  meetingId,
  meetingTitle,
  onClose,
  onSaved,
  inlineEndOffset,
  elapsedDuration,
}) {
  const { t } = useTranslation()
  const mutations = useMeetingMutations()
  const resolvedMeetingId = String(meetingId || '').trim()
  const meetingInfoQuery = useMeetingInfo(resolvedMeetingId, undefined, {
    enabled: Boolean(open && resolvedMeetingId && !meetingTitle),
  })
  const meetingInfo = getMeetingInfoPayload(meetingInfoQuery.data, null)
  const resolvedMeetingTitle = meetingTitle || meetingInfo?.title || ''

  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [previewTemplateId, setPreviewTemplateId] = useState('')
  const [activeTemplateId, setActiveTemplateId] = useState('')
  const [activeTemplateDraft, setActiveTemplateDraft] = useState(null)
  const [values, setValues] = useState({})

  useEffect(() => {
    if (!open) return

    setSelectedTemplateId('')
    setPreviewTemplateId('')
    setActiveTemplateId('')
    setActiveTemplateDraft(null)
    setValues({})
  }, [open, resolvedMeetingId])

  const handleDrawerClose = () => {
    if (!activeTemplate || !hasAfterMeetingValues(values)) {
      onClose?.()
      return
    }

    const shouldClose = window.confirm(t('activities.afterMeetingReport.closeConfirm'))
    if (shouldClose) {
      onClose?.()
    }
  }

  const selectedTemplate = useMemo(
    () => getAfterMeetingTemplateById(selectedTemplateId, t),
    [selectedTemplateId, t],
  )
  const previewTemplate = useMemo(
    () => getAfterMeetingTemplateById(previewTemplateId, t),
    [previewTemplateId, t],
  )
  const activeTemplate = useMemo(
    () => activeTemplateDraft || getAfterMeetingTemplateById(activeTemplateId, t),
    [activeTemplateDraft, activeTemplateId, t],
  )

  const selectTemplate = (templateId) => {
    if (
      activeTemplateId &&
      templateId !== activeTemplateId &&
      hasAfterMeetingValues(values) &&
      !window.confirm(t('activities.afterMeetingReport.changeTemplateConfirm'))
    ) {
      return
    }

    setSelectedTemplateId(templateId)
  }

  const handlePreview = () => {
    if (!selectedTemplateId) {
      toast.error(t('activities.preMeetingReport.chooseTemplateFirst'))
      return
    }

    setPreviewTemplateId(selectedTemplateId)
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      toast.error(t('activities.preMeetingReport.chooseTemplateFirst'))
      return
    }

    setActiveTemplateId(selectedTemplate.id)
    setActiveTemplateDraft(createAfterMeetingEditableTemplate(selectedTemplate, t))
    setValues(createAfterMeetingInitialValues(selectedTemplate))
    setPreviewTemplateId('')
  }

  const updateActiveTemplateMeta = (key, value) => {
    setActiveTemplateDraft((current) => {
      if (!current) return current

      return {
        ...current,
        [key]: value,
      }
    })
  }

  const updateActiveTemplateFieldLabel = (fieldKey, label) => {
    setActiveTemplateDraft((current) => {
      if (!current) return current

      return {
        ...current,
        fields: (current.fields || []).map((field) => (
          field.key === fieldKey
            ? { ...field, label }
            : field
        )),
      }
    })
  }

  const updateValue = (key, value) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!resolvedMeetingId) {
      toast.error(t('activities.preMeetingReport.noMeetingIdError'))
      return
    }

    if (!activeTemplate) {
      toast.error(t('activities.preMeetingReport.applyTemplateFirst'))
      return
    }

    const missingRequiredField = validateAfterMeetingRequiredFields(activeTemplate, values)

    if (missingRequiredField) {
      toast.error(t('activities.preMeetingReport.completeFieldError', { field: missingRequiredField.label }))
      return
    }

    const reportText = buildAfterMeetingReportText(activeTemplate, values, {
      meetingTitle: resolvedMeetingTitle,
      reportHeading: activeTemplate?.reportHeading,
      elapsedDuration,
    }, t)

    await mutations.createReport.mutateAsync({
      meetingId: resolvedMeetingId,
      payload: {
        title: activeTemplate?.headerTitle || activeTemplate?.title || 'after-meeting report',
        notes: reportText,
      },
    })

    toast.success(t('activities.afterMeetingReport.savedToast'))
    onSaved?.()
    onClose?.()
  }

  return (
    <AppDrawer
      open={open}
      onClose={handleDrawerClose}
      title={t('activities.meetingDrawer.afterMeetingReportLabel')}
      description={t('activities.afterMeetingReport.drawerDescription')}
      size="xl"
      drawerKey="after-meeting-report"
      className="border-s border-[#BEEFF2] shadow-2xl"
      containerClassName="z-[150000]"
      resizable
      minWidth={520}
      maxWidth={1400}
      closeOnBackdrop={false}
      pushPage={false}
      portal
      inlineEndOffset={inlineEndOffset}
      topOffset="calc(var(--layout-header-height, 48px) - 1px)"
    >
      <form id={FORM_ID} className="space-y-5" onSubmit={handleSubmit}>
        {resolvedMeetingId ? (
          <div className="rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-3 text-xs font-bold text-[var(--text)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[#007A80]">
                <Hash size={13} />
                {resolvedMeetingId}
              </span>
              <span className="min-w-0 break-words font-black">
                {t('activities.preMeetingReport.linkedMeetingLabel', { title: resolvedMeetingTitle || t('activities.preMeetingReport.untitled') })}
              </span>
            </div>
            {elapsedDuration ? (
              <div className="mt-2 rounded-lg border border-[#BBF7D0] bg-white px-2 py-1 text-[11px] font-black text-[#166534]">
                {t('activities.afterMeetingReport.elapsedDurationLabel', { value: elapsedDuration })}
              </div>
            ) : null}
          </div>
        ) : null}

        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-black text-[var(--text)]">{t('activities.afterMeetingReport.chooseResultTemplateTitle')}</h3>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              {t('activities.afterMeetingReport.templateHint')}
            </p>
          </div>

          <AfterMeetingTemplateSelector selectedTemplateId={selectedTemplateId} onSelect={selectTemplate} />

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={handlePreview} disabled={!selectedTemplateId}>
              <Eye size={15} />
              {t('activities.preMeetingReport.previewTemplate')}
            </Button>

            <Button type="button" variant="ai" onClick={handleApplyTemplate} disabled={!selectedTemplateId}>
              {t('activities.preMeetingReport.applyTemplate')}
            </Button>
          </div>
        </section>

        <AfterMeetingTemplatePreview template={previewTemplate} onApply={handleApplyTemplate} />

        {activeTemplateDraft ? (
          <section className="space-y-3 rounded-xl border border-[#D7E2E6] bg-white p-4">
            <div>
              <h3 className="text-sm font-black text-[var(--text)]">{t('activities.afterMeetingReport.documentFormatTitle')}</h3>
              <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                {t('activities.afterMeetingReport.documentFormatHint')}
              </p>
            </div>

            <div className="grid gap-2">
              <InlineEditableTitle
                label={t('activities.afterMeetingReport.mainHeaderLabel')}
                value={activeTemplateDraft.reportHeading || ''}
                onSave={(nextValue) => updateActiveTemplateMeta('reportHeading', nextValue)}
                placeholder={t('activities.afterMeetingReport.mainHeaderPlaceholder')}
              />

              <InlineEditableTitle
                label={t('activities.afterMeetingReport.templateTitleLabel')}
                value={activeTemplateDraft.headerTitle || ''}
                onSave={(nextValue) => updateActiveTemplateMeta('headerTitle', nextValue)}
                placeholder={t('activities.afterMeetingReport.templateTitlePlaceholder')}
              />

              <InlineEditableTitle
                label={t('activities.afterMeetingReport.headerSubtitleLabel')}
                value={activeTemplateDraft.headerSubtitle || ''}
                onSave={(nextValue) => updateActiveTemplateMeta('headerSubtitle', nextValue)}
                multiline
                placeholder={t('activities.afterMeetingReport.headerSubtitlePlaceholder')}
              />
            </div>

            <details className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <summary className="cursor-pointer text-xs font-black text-[#007A80]">{t('activities.afterMeetingReport.editFieldTitlesSummary')}</summary>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {(activeTemplateDraft.fields || []).map((field) => (
                  <InlineEditableTitle
                    key={field.key}
                    label={field.key}
                    value={field.label || ''}
                    onSave={(nextValue) => updateActiveTemplateFieldLabel(field.key, nextValue)}
                    placeholder={t('activities.afterMeetingReport.fieldTitlePlaceholder')}
                  />
                ))}
              </div>
            </details>
          </section>
        ) : null}

        <AfterMeetingDynamicForm template={activeTemplate} values={values} onChange={updateValue} />

        <div className="sticky -bottom-4 -mx-4 mt-4 flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('actions.cancel')}
          </Button>

          <Button
            type="submit"
            form={FORM_ID}
            variant="ai"
            disabled={!activeTemplate}
            loading={mutations.createReport.isPending}
          >
            <FileText size={15} />
            {t('activities.preMeetingReport.saveReport')}
          </Button>
        </div>
      </form>
    </AppDrawer>
  )
}
