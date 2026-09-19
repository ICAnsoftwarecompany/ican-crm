import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Eye,
  FileText,
  Home,
  Presentation,
  Target,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { useMeetingInfo, useMeetingMutations } from '../../../meetings/hooks/useMeetings'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { getMeetingInfoPayload } from '../ScheduleDetails/scheduleDetailsUtils'

const FORM_ID = 'pre-meeting-report-form'

function getPreMeetingTemplates(t) {
  const opt = (key) => t(`activities.preMeetingReport.options.${key}`)
  const field = (template, key, extra = {}) => ({
    key,
    label: t(`activities.preMeetingReport.templates.${template}.fields.${key}.label`),
    ...extra,
  })
  const withPlaceholder = (template, key, type, extra = {}) => ({
    ...field(template, key, { type, ...extra }),
    placeholder: t(`activities.preMeetingReport.templates.${template}.fields.${key}.placeholder`),
  })

  return [
    {
      id: 'real-estate-discovery',
      title: t('activities.preMeetingReport.templates.realEstateDiscovery.title'),
      description: t('activities.preMeetingReport.templates.realEstateDiscovery.description'),
      category: 'real_estate',
      icon: Home,
      fields: [
        withPlaceholder('realEstateDiscovery', 'meeting_objective', 'textarea', { required: true }),
        field('realEstateDiscovery', 'property_type', {
          type: 'select',
          required: true,
          options: [opt('apartment'), opt('villa'), opt('townhouse'), opt('duplex'), opt('officeAdmin'), opt('commercialShop'), opt('land'), opt('other')],
        }),
        withPlaceholder('realEstateDiscovery', 'preferred_location', 'text'),
        withPlaceholder('realEstateDiscovery', 'expected_budget', 'text'),
        field('realEstateDiscovery', 'purchase_purpose', {
          type: 'select',
          options: [opt('residential'), opt('investment'), opt('commercial'), opt('administrative'), opt('resale')],
        }),
        field('realEstateDiscovery', 'payment_method', {
          type: 'select',
          options: [opt('cash'), opt('installment'), opt('cashOrInstallment'), opt('unspecified')],
        }),
        withPlaceholder('realEstateDiscovery', 'decision_maker', 'text'),
        withPlaceholder('realEstateDiscovery', 'questions_to_ask', 'textarea'),
      ],
    },

    {
      id: 'property-requirements',
      title: t('activities.preMeetingReport.templates.propertyRequirements.title'),
      description: t('activities.preMeetingReport.templates.propertyRequirements.description'),
      category: 'real_estate',
      icon: Building2,
      fields: [
        field('propertyRequirements', 'property_type', {
          type: 'select',
          required: true,
          options: [opt('apartment'), opt('villa'), opt('townhouse'), opt('duplex'), opt('chalet'), opt('office'), opt('shop')],
        }),
        withPlaceholder('propertyRequirements', 'preferred_projects', 'textarea'),
        withPlaceholder('propertyRequirements', 'area_requirement', 'text'),
        field('propertyRequirements', 'bedrooms', {
          type: 'select',
          options: ['1', '2', '3', '4', '5+', opt('unspecified')],
        }),
        withPlaceholder('propertyRequirements', 'delivery_date', 'text'),
        field('propertyRequirements', 'budget', { type: 'text' }),
        field('propertyRequirements', 'down_payment', { type: 'text' }),
        field('propertyRequirements', 'installment_period', { type: 'text' }),
        withPlaceholder('propertyRequirements', 'must_have_features', 'textarea'),
      ],
    },

    {
      id: 'real-estate-negotiation',
      title: t('activities.preMeetingReport.templates.realEstateNegotiation.title'),
      description: t('activities.preMeetingReport.templates.realEstateNegotiation.description'),
      category: 'real_estate',
      icon: Target,
      fields: [
        field('realEstateNegotiation', 'meeting_objective', { type: 'textarea', required: true }),
        field('realEstateNegotiation', 'selected_property', { type: 'text', required: true }),
        field('realEstateNegotiation', 'offered_price', { type: 'text' }),
        field('realEstateNegotiation', 'customer_budget', { type: 'text' }),
        field('realEstateNegotiation', 'customer_objections', { type: 'textarea' }),
        withPlaceholder('realEstateNegotiation', 'negotiation_points', 'textarea'),
        field('realEstateNegotiation', 'decision_maker', { type: 'text' }),
        field('realEstateNegotiation', 'expected_close_date', { type: 'date' }),
        field('realEstateNegotiation', 'closing_strategy', { type: 'textarea' }),
      ],
    },

    {
      id: 'general-sales',
      title: t('activities.preMeetingReport.templates.generalSales.title'),
      description: t('activities.preMeetingReport.templates.generalSales.description'),
      category: 'general',
      icon: Users,
      fields: [
        field('generalSales', 'meeting_objective', { type: 'textarea', required: true }),
        field('generalSales', 'customer_needs', { type: 'textarea', required: true }),
        field('generalSales', 'customer_problems', { type: 'textarea' }),
        field('generalSales', 'interested_products', { type: 'textarea' }),
        field('generalSales', 'expected_budget', { type: 'text' }),
        field('generalSales', 'decision_maker', { type: 'text' }),
        field('generalSales', 'objections', { type: 'textarea' }),
        field('generalSales', 'questions_to_ask', { type: 'textarea' }),
        field('generalSales', 'desired_next_step', { type: 'text' }),
      ],
    },

    {
      id: 'demo-presentation',
      title: t('activities.preMeetingReport.templates.demoPresentation.title'),
      description: t('activities.preMeetingReport.templates.demoPresentation.description'),
      category: 'general',
      icon: Presentation,
      fields: [
        field('demoPresentation', 'demo_goal', { type: 'textarea', required: true }),
        field('demoPresentation', 'current_solution', { type: 'text' }),
        field('demoPresentation', 'current_problems', { type: 'textarea', required: true }),
        field('demoPresentation', 'features_to_show', { type: 'textarea', required: true }),
        field('demoPresentation', 'customer_priorities', { type: 'textarea' }),
        field('demoPresentation', 'expected_questions', { type: 'textarea' }),
        field('demoPresentation', 'decision_maker', { type: 'text' }),
        field('demoPresentation', 'budget', { type: 'text' }),
        field('demoPresentation', 'target_next_step', {
          type: 'select',
          options: [opt('trySystem'), opt('sendQuote'), opt('anotherMeeting'), opt('startNegotiation'), opt('closeDeal')],
        }),
      ],
    },
  ]
}

function createEmptyTemplateValues(template) {
  return template.fields.reduce((values, field) => {
    values[field.key] = ''
    return values
  }, {})
}

function buildReportText(template, values) {
  const lines = [
    `Template: ${template.title}`,
    '',
  ]

  template.fields.forEach((field) => {
    const value = values[field.key]

    if (!value) return

    lines.push(`${field.label}:`)
    lines.push(String(value))
    lines.push('')
  })

  return lines.join('\n').trim()
}

function TemplateField({ field, value, onChange }) {
  const { t } = useTranslation()
  const inputClassName =
    'h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'

  const textareaClassName =
    'min-h-24 w-full min-w-0 resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-[var(--text)]">
        {field.label}
        {field.required ? (
          <span className="ms-1 text-red-500">*</span>
        ) : null}
      </label>

      {field.type === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder || ''}
          className={textareaClassName}
        />
      )}

      {field.type === 'select' && (
        <select
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        >
          <option value="">{t('common.choose')}</option>

          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {field.type === 'date' && (
        <input
          type="date"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        />
      )}

      {field.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder || ''}
          className={inputClassName}
        />
      )}
    </div>
  )
}

export function PreMeetingReportDrawer({
  open,
  meetingId,
  meetingTitle,
  onClose,
  onSaved,
  inlineEndOffset,
}) {
  const { t } = useTranslation()
  const mutations = useMeetingMutations()
  const resolvedMeetingId = String(meetingId || '').trim()
  const meetingInfoQuery = useMeetingInfo(resolvedMeetingId, undefined, {
    enabled: Boolean(open && resolvedMeetingId && !meetingTitle),
  })
  const meetingInfo = getMeetingInfoPayload(meetingInfoQuery.data, null)
  const resolvedMeetingTitle = meetingTitle || meetingInfo?.title || ''

  const PRE_MEETING_TEMPLATES = useMemo(() => getPreMeetingTemplates(t), [t])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [previewTemplateId, setPreviewTemplateId] = useState('')
  const [activeTemplateId, setActiveTemplateId] = useState('')
  const [values, setValues] = useState({})

  useEffect(() => {
    if (!open) return

    setSelectedTemplateId('')
    setPreviewTemplateId('')
    setActiveTemplateId('')
    setValues({})
  }, [open, resolvedMeetingId])

  const selectedTemplate = useMemo(
    () =>
      PRE_MEETING_TEMPLATES.find(
        (template) => template.id === selectedTemplateId,
      ),
    [PRE_MEETING_TEMPLATES, selectedTemplateId],
  )

  const previewTemplate = useMemo(
    () =>
      PRE_MEETING_TEMPLATES.find(
        (template) => template.id === previewTemplateId,
      ),
    [PRE_MEETING_TEMPLATES, previewTemplateId],
  )

  const activeTemplate = useMemo(
    () =>
      PRE_MEETING_TEMPLATES.find(
        (template) => template.id === activeTemplateId,
      ),
    [PRE_MEETING_TEMPLATES, activeTemplateId],
  )

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
    setValues(createEmptyTemplateValues(selectedTemplate))
    setPreviewTemplateId('')
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

    const missingRequiredField = activeTemplate.fields.find(
      (field) => field.required && !String(values[field.key] || '').trim(),
    )

    if (missingRequiredField) {
      toast.error(t('activities.preMeetingReport.completeFieldError', { field: missingRequiredField.label }))
      return
    }

    const reportText = buildReportText(activeTemplate, values)

    await mutations.createReport.mutateAsync({
      meetingId: resolvedMeetingId,
      payload: {
        title: 'Pre-meeting report',
        notes: reportText,
      },
    })

    toast.success(t('activities.preMeetingReport.savedToast'))
    onSaved?.()
    onClose?.()
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={t('activities.preMeetingReport.title')}
      size="lg"
      drawerKey="pre-meeting-report"
      className="border-s border-[#BEEFF2] shadow-2xl"
      containerClassName="z-[140000]"
      closeOnBackdrop={false}
      pushPage={false}
      portal
      inlineEndOffset={inlineEndOffset}
      topOffset="calc(var(--layout-header-height, 48px) - 1px)"
    >
      <form
        id={FORM_ID}
        className="space-y-5"
        onSubmit={handleSubmit}
      >
        {resolvedMeetingId ? (
          <div className="rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-3 text-xs font-bold text-[var(--text)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 font-black text-[#007A80]">
                {t('activities.preMeetingReport.meetingNumberLabel', { id: resolvedMeetingId })}
              </span>
              <span className="min-w-0 break-words font-black">
                {t('activities.preMeetingReport.linkedMeetingLabel', { title: resolvedMeetingTitle || t('activities.preMeetingReport.untitled') })}
              </span>
            </div>
          </div>
        ) : null}

        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-black text-[var(--text)]">
              {t('activities.preMeetingReport.chooseTemplateTitle')}
            </h3>

            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              {t('activities.preMeetingReport.chooseTemplateHint')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PRE_MEETING_TEMPLATES.map((template) => {
              const Icon = template.icon
              const selected = selectedTemplateId === template.id

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={[
                    'rounded-xl border p-3 text-start transition',
                    selected
                      ? 'border-[#00C2CB] bg-[#F0FCFD] ring-2 ring-[#BEEFF2]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[#9CE3E7]',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EAFBFC] text-[#007A80]">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-black text-[var(--text)]">
                        {template.title}
                      </div>

                      <div className="mt-1 text-xs font-semibold leading-5 text-[var(--muted)]">
                        {template.description}
                      </div>

                      <div className="mt-2 text-[11px] font-black text-[#007A80]">
                        {template.category === 'real_estate'
                          ? t('activities.preMeetingReport.categoryRealEstate')
                          : t('activities.preMeetingReport.categoryGeneral')}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={!selectedTemplateId}
            >
              <Eye size={15} />
              {t('activities.preMeetingReport.previewTemplate')}
            </Button>

            <Button
              type="button"
              variant="ai"
              onClick={handleApplyTemplate}
              disabled={!selectedTemplateId}
            >
              {t('activities.preMeetingReport.applyTemplate')}
            </Button>
          </div>
        </section>

        {previewTemplate && (
          <section className="rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Eye size={16} className="text-[#007A80]" />

              <div>
                <div className="text-sm font-black text-[var(--text)]">
                  {t('activities.preMeetingReport.previewPrefix', { title: previewTemplate.title })}
                </div>

                <div className="text-xs font-semibold text-[var(--muted)]">
                  {t('activities.preMeetingReport.previewFieldsHint')}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {previewTemplate.fields.map((field, index) => (
                <div
                  key={field.key}
                  className="flex items-start gap-3 rounded-lg border border-[#E5F7F8] bg-white p-3"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#EAFBFC] text-xs font-black text-[#007A80]">
                    {index + 1}
                  </div>

                  <div>
                    <div className="text-xs font-black text-[var(--text)]">
                      {field.label}

                      {field.required && (
                        <span className="ms-1 text-red-500">*</span>
                      )}
                    </div>

                    {field.options?.length ? (
                      <div className="mt-1 text-[11px] font-semibold text-[var(--muted)]">
                        {t('activities.preMeetingReport.optionsLabel', { options: field.options.join(t('common.listSeparator')) })}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="ai"
                onClick={handleApplyTemplate}
              >
                {t('activities.preMeetingReport.applyThisTemplate')}
              </Button>
            </div>
          </section>
        )}

        {activeTemplate && (
          <section className="rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-[var(--text)]">
              <FileText size={16} className="text-[#007A80]" />
              {activeTemplate.title}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {activeTemplate.fields.map((field) => (
                <div
                  key={field.key}
                  className={
                    field.type === 'textarea'
                      ? 'sm:col-span-2'
                      : ''
                  }
                >
                  <TemplateField
                    field={field}
                    value={values[field.key]}
                    onChange={(value) =>
                      updateValue(field.key, value)
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {!activeTemplate && (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
            <FileText
              size={28}
              className="mx-auto mb-2 text-[var(--muted)]"
            />

            <p className="text-sm font-black text-[var(--text)]">
              {t('activities.preMeetingReport.noTemplateAppliedTitle')}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              {t('activities.preMeetingReport.noTemplateAppliedHint')}
            </p>
          </div>
        )}

        <div className="sticky -bottom-4 -mx-4 mt-4 flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('activities.preMeetingReport.cancel')}
          </Button>

          <Button
            type="submit"
            form={FORM_ID}
            variant="ai"
            disabled={!activeTemplate}
            loading={mutations.createReport.isPending}
          >
            {t('activities.preMeetingReport.saveReport')}
          </Button>
        </div>
      </form>
    </AppDrawer>
  )
}
