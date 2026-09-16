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

import { useMeetingInfo, useMeetingMutations } from '../../../meetings/hooks/useMeetings'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { getMeetingInfoPayload } from '../ScheduleDetails/scheduleDetailsUtils'

const FORM_ID = 'pre-meeting-report-form'

const PRE_MEETING_TEMPLATES = [
  {
    id: 'real-estate-discovery',
    title: 'استكشاف عميل عقاري',
    description: 'مناسب لأول اجتماع مع عميل مهتم بشراء أو استئجار عقار.',
    category: 'real_estate',
    icon: Home,
    fields: [
      {
        key: 'meeting_objective',
        label: 'هدف الاجتماع',
        type: 'textarea',
        required: true,
        placeholder: 'ما الهدف الأساسي من الاجتماع؟',
      },
      {
        key: 'property_type',
        label: 'نوع العقار المطلوب',
        type: 'select',
        required: true,
        options: [
          'شقة',
          'فيلا',
          'تاون هاوس',
          'دوبلكس',
          'مكتب إداري',
          'محل تجاري',
          'أرض',
          'أخرى',
        ],
      },
      {
        key: 'preferred_location',
        label: 'المنطقة المطلوبة',
        type: 'text',
        placeholder: 'مثال: التجمع الخامس',
      },
      {
        key: 'expected_budget',
        label: 'الميزانية المتوقعة',
        type: 'text',
        placeholder: 'مثال: من 5 إلى 7 مليون',
      },
      {
        key: 'purchase_purpose',
        label: 'الغرض من العقار',
        type: 'select',
        options: ['سكن', 'استثمار', 'تجاري', 'إداري', 'إعادة بيع'],
      },
      {
        key: 'payment_method',
        label: 'طريقة الدفع المفضلة',
        type: 'select',
        options: ['كاش', 'تقسيط', 'كاش أو تقسيط', 'غير محدد'],
      },
      {
        key: 'decision_maker',
        label: 'صاحب القرار',
        type: 'text',
        placeholder: 'من صاحب قرار الشراء؟',
      },
      {
        key: 'questions_to_ask',
        label: 'أسئلة يجب طرحها',
        type: 'textarea',
        placeholder: 'اكتب أهم الأسئلة المطلوب مناقشتها...',
      },
    ],
  },

  {
    id: 'property-requirements',
    title: 'تحديد متطلبات العقار',
    description: 'لجمع احتياجات العميل بالتفصيل قبل ترشيح الوحدات المناسبة.',
    category: 'real_estate',
    icon: Building2,
    fields: [
      {
        key: 'property_type',
        label: 'نوع الوحدة',
        type: 'select',
        required: true,
        options: [
          'شقة',
          'فيلا',
          'تاون هاوس',
          'دوبلكس',
          'شاليه',
          'مكتب',
          'محل',
        ],
      },
      {
        key: 'preferred_projects',
        label: 'المشروعات أو المناطق المفضلة',
        type: 'textarea',
        placeholder: 'اذكر المشروعات أو المناطق التي يفضلها العميل.',
      },
      {
        key: 'area_requirement',
        label: 'المساحة المطلوبة',
        type: 'text',
        placeholder: 'مثال: من 150 إلى 200 متر',
      },
      {
        key: 'bedrooms',
        label: 'عدد الغرف',
        type: 'select',
        options: ['1', '2', '3', '4', '5+', 'غير محدد'],
      },
      {
        key: 'delivery_date',
        label: 'موعد الاستلام المناسب',
        type: 'text',
        placeholder: 'فوري / سنة / سنتين / غير محدد',
      },
      {
        key: 'budget',
        label: 'الميزانية',
        type: 'text',
      },
      {
        key: 'down_payment',
        label: 'المقدم المناسب',
        type: 'text',
      },
      {
        key: 'installment_period',
        label: 'مدة التقسيط المطلوبة',
        type: 'text',
      },
      {
        key: 'must_have_features',
        label: 'المتطلبات الأساسية',
        type: 'textarea',
        placeholder: 'جاردن، دور معين، View، تشطيب، Parking...',
      },
    ],
  },

  {
    id: 'real-estate-negotiation',
    title: 'تفاوض وإغلاق صفقة عقارية',
    description: 'مناسب للاجتماعات المتقدمة بعد ترشيح الوحدة أو تقديم العرض.',
    category: 'real_estate',
    icon: Target,
    fields: [
      {
        key: 'meeting_objective',
        label: 'هدف الاجتماع',
        type: 'textarea',
        required: true,
      },
      {
        key: 'selected_property',
        label: 'الوحدة أو المشروع محل التفاوض',
        type: 'text',
        required: true,
      },
      {
        key: 'offered_price',
        label: 'السعر الحالي',
        type: 'text',
      },
      {
        key: 'customer_budget',
        label: 'ميزانية العميل',
        type: 'text',
      },
      {
        key: 'customer_objections',
        label: 'اعتراضات العميل السابقة',
        type: 'textarea',
      },
      {
        key: 'negotiation_points',
        label: 'نقاط التفاوض',
        type: 'textarea',
        placeholder: 'السعر، المقدم، سنوات التقسيط، الاستلام...',
      },
      {
        key: 'decision_maker',
        label: 'صاحب القرار',
        type: 'text',
      },
      {
        key: 'expected_close_date',
        label: 'موعد الإغلاق المتوقع',
        type: 'date',
      },
      {
        key: 'closing_strategy',
        label: 'خطة إغلاق الصفقة',
        type: 'textarea',
      },
    ],
  },

  {
    id: 'general-sales',
    title: 'اجتماع مبيعات عام',
    description: 'قالب عام لأي اجتماع مبيعات أو متابعة مع العميل.',
    category: 'general',
    icon: Users,
    fields: [
      {
        key: 'meeting_objective',
        label: 'هدف الاجتماع',
        type: 'textarea',
        required: true,
      },
      {
        key: 'customer_needs',
        label: 'احتياجات العميل',
        type: 'textarea',
        required: true,
      },
      {
        key: 'customer_problems',
        label: 'المشكلات الحالية',
        type: 'textarea',
      },
      {
        key: 'interested_products',
        label: 'المنتجات أو الخدمات المهتم بها',
        type: 'textarea',
      },
      {
        key: 'expected_budget',
        label: 'الميزانية المتوقعة',
        type: 'text',
      },
      {
        key: 'decision_maker',
        label: 'صاحب القرار',
        type: 'text',
      },
      {
        key: 'objections',
        label: 'الاعتراضات المتوقعة',
        type: 'textarea',
      },
      {
        key: 'questions_to_ask',
        label: 'الأسئلة المطلوب طرحها',
        type: 'textarea',
      },
      {
        key: 'desired_next_step',
        label: 'الخطوة المستهدفة بعد الاجتماع',
        type: 'text',
      },
    ],
  },

  {
    id: 'demo-presentation',
    title: 'عرض أو Demo',
    description: 'مناسب لاجتماع عرض منتج أو خدمة أو تقديم Demo للعميل.',
    category: 'general',
    icon: Presentation,
    fields: [
      {
        key: 'demo_goal',
        label: 'هدف الـ Demo',
        type: 'textarea',
        required: true,
      },
      {
        key: 'current_solution',
        label: 'الحل أو النظام المستخدم حاليًا',
        type: 'text',
      },
      {
        key: 'current_problems',
        label: 'المشكلات الحالية',
        type: 'textarea',
        required: true,
      },
      {
        key: 'features_to_show',
        label: 'النقاط أو المميزات المطلوب عرضها',
        type: 'textarea',
        required: true,
      },
      {
        key: 'customer_priorities',
        label: 'أولويات العميل',
        type: 'textarea',
      },
      {
        key: 'expected_questions',
        label: 'الأسئلة المتوقعة',
        type: 'textarea',
      },
      {
        key: 'decision_maker',
        label: 'صاحب القرار',
        type: 'text',
      },
      {
        key: 'budget',
        label: 'الميزانية المتوقعة',
        type: 'text',
      },
      {
        key: 'target_next_step',
        label: 'النتيجة المستهدفة',
        type: 'select',
        options: [
          'تجربة النظام',
          'إرسال عرض سعر',
          'اجتماع آخر',
          'بدء التفاوض',
          'إغلاق الصفقة',
        ],
      },
    ],
  },
]

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
          <option value="">اختر...</option>

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
    [selectedTemplateId],
  )

  const previewTemplate = useMemo(
    () =>
      PRE_MEETING_TEMPLATES.find(
        (template) => template.id === previewTemplateId,
      ),
    [previewTemplateId],
  )

  const activeTemplate = useMemo(
    () =>
      PRE_MEETING_TEMPLATES.find(
        (template) => template.id === activeTemplateId,
      ),
    [activeTemplateId],
  )

  const handlePreview = () => {
    if (!selectedTemplateId) {
      toast.error('اختر قالب أولا.')
      return
    }

    setPreviewTemplateId(selectedTemplateId)
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      toast.error('اختر قالب أولا.')
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
      toast.error('لا يوجد رقم اجتماع لإضافة التقرير.')
      return
    }

    if (!activeTemplate) {
      toast.error('اختر وطبّق قالب التقرير أولا.')
      return
    }

    const missingRequiredField = activeTemplate.fields.find(
      (field) => field.required && !String(values[field.key] || '').trim(),
    )

    if (missingRequiredField) {
      toast.error(`أكمل حقل: ${missingRequiredField.label}`)
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

    toast.success('تم حفظ تقرير قبل الاجتماع.')
    onSaved?.()
    onClose?.()
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="تقرير قبل الاجتماع"
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
                رقم الاجتماع: {resolvedMeetingId}
              </span>
              <span className="min-w-0 break-words font-black">
                الاجتماع المرتبط: {resolvedMeetingTitle || 'بدون عنوان'}
              </span>
            </div>
          </div>
        ) : null}

        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-black text-[var(--text)]">
              اختر قالب التحضير
            </h3>

            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              يمكنك عرض القالب أولا ثم تطبيقه على التقرير.
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
                          ? 'قطاع العقارات'
                          : 'قالب عام'}
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
              عرض القالب
            </Button>

            <Button
              type="button"
              variant="ai"
              onClick={handleApplyTemplate}
              disabled={!selectedTemplateId}
            >
              تطبيق القالب
            </Button>
          </div>
        </section>

        {previewTemplate && (
          <section className="rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Eye size={16} className="text-[#007A80]" />

              <div>
                <div className="text-sm font-black text-[var(--text)]">
                  معاينة: {previewTemplate.title}
                </div>

                <div className="text-xs font-semibold text-[var(--muted)]">
                  الحقول التي سيحتوي عليها التقرير
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
                        الخيارات: {field.options.join('، ')}
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
                تطبيق هذا القالب
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
              لم يتم تطبيق قالب بعد
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              اختر أحد القوالب بالأعلى ثم قم بعرضه أو تطبيقه.
            </p>
          </div>
        )}

        <div className="sticky -bottom-4 -mx-4 mt-4 flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            form={FORM_ID}
            variant="ai"
            disabled={!activeTemplate}
            loading={mutations.createReport.isPending}
          >
            حفظ التقرير
          </Button>
        </div>
      </form>
    </AppDrawer>
  )
}
