import { Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../../shared/components/ui/Button'

export function AfterMeetingTemplatePreview({ template, onApply }) {
  const { t } = useTranslation()

  if (!template) return null

  return (
    <section className="rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-4">
      <div className="mb-4 flex items-center gap-2">
        <Eye size={16} className="text-[#007A80]" />
        <div>
          <div className="text-sm font-black text-[var(--text)]">{t('activities.preMeetingReport.previewPrefix', { title: template.title })}</div>
          <div className="text-xs font-semibold text-[var(--muted)]">
            {template.description} - {t('activities.afterMeetingReport.fieldsCountSuffix', { count: template.fields.length })}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3">
        <div className="text-center text-base font-black text-[#0F172A]">{template.reportHeading || t('activities.meetingDrawer.afterMeetingReportLabel')}</div>
        <div className="mt-1 text-center text-sm font-bold text-[#1E293B]">{template.headerTitle || template.title}</div>
        {template.headerSubtitle ? (
          <div className="mt-1 text-center text-xs font-semibold leading-6 text-[#64748B]">{template.headerSubtitle}</div>
        ) : null}
      </div>

      <div className="space-y-2">
        {template.fields.map((field, index) => (
          <div key={field.key} className="flex items-start gap-3 rounded-lg border border-[#E5F7F8] bg-white p-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#EAFBFC] text-xs font-black text-[#007A80]">
              {index + 1}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-[var(--text)]">
                {field.label}
                {field.required ? <span className="ms-1 text-red-500">*</span> : null}
              </div>
              {field.options?.length ? (
                <div className="mt-1 text-[11px] font-semibold leading-5 text-[var(--muted)]">
                  {t('activities.preMeetingReport.optionsLabel', { options: field.options.join(t('common.listSeparator')) })}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" variant="ai" onClick={onApply}>
          {t('activities.preMeetingReport.applyThisTemplate')}
        </Button>
      </div>
    </section>
  )
}
