import { LayoutTemplate } from 'lucide-react'

import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { WhatsappLogoIcon } from '../../features/conversations/components/WhatsappNavbarButton'
import { WhatsappTemplatesDialog } from '../../features/conversations/components/WhatsappTemplatesDialog'

export function TemplatesPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <PageToolbar
        title="القوالب"
        description="مركز واحد لإدارة قوالب القنوات. أول نوع متاح حاليا هو قوالب WhatsApp."
      />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9FFF2] text-[#087D3E]">
            <WhatsappLogoIcon size={24} />
          </span>
          <div>
            <h2 className="text-base font-black text-[var(--text)]">قوالب WhatsApp</h2>
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              إنشاء القوالب، رفع الميديا، متابعة الحالة، وإرسال أول رسالة Template.
            </p>
          </div>
          <LayoutTemplate size={18} className="ms-auto text-[var(--text-light)]" />
        </div>

        <WhatsappTemplatesDialog open embedded />
      </section>
    </div>
  )
}
