import { FileText } from 'lucide-react'

import { AfterMeetingFieldRenderer } from './AfterMeetingFieldRenderer'

export function AfterMeetingDynamicForm({ template, values, onChange }) {
  if (!template) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
        <FileText size={28} className="mx-auto mb-2 text-[var(--muted)]" />
        <p className="text-sm font-black text-[var(--text)]">لم يتم تطبيق قالب بعد</p>
        <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
          اختر أحد القوالب بالأعلى ثم قم بعرضه أو تطبيقه.
        </p>
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-black text-[var(--text)]">
        <FileText size={16} className="text-[#007A80]" />
        <span>القالب المستخدم: {template.headerTitle || template.title}</span>
      </div>

      {template.headerSubtitle ? (
        <p className="-mt-2 mb-4 text-xs font-semibold text-[var(--muted)]">{template.headerSubtitle}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {template.fields.map((field) => (
          <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <AfterMeetingFieldRenderer
              field={field}
              value={values[field.key]}
              onChange={(value) => onChange(field.key, value)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
