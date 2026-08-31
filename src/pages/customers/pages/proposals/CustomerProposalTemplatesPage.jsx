import { Link } from 'react-router-dom'
import { ArrowRight, Copy, FileSignature, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'

import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { Button } from '../../../../shared/components/ui/Button'
import { useProposalTemplateMutations, useProposalTemplates } from '../../../../features/proposals'

export function CustomerProposalTemplatesPage() {
  const templatesQuery = useProposalTemplates()
  const mutations = useProposalTemplateMutations()
  const templates = templatesQuery.data || []

  const run = async (promise, message) => {
    await promise
    toast.success(message)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageToolbar title="قوالب عروض الأسعار" description="القوالب هي نقطة البداية للـ Proposal، والـ Builder يحولها لتجربة تحرير مرئية.">
        <Link to="/customers/proposals">
          <Button variant="outline">
            <ArrowRight size={16} />
            العروض
          </Button>
        </Link>
      </PageToolbar>

      {templatesQuery.isLoading ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm font-black text-[var(--text-muted)]">
          جاري تحميل القوالب...
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article key={template.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F9FA] text-[#007A80]">
                <FileSignature size={22} />
              </span>
              <span className={`rounded-full px-2 py-1 text-xs font-black ${template.is_active ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FEF2F2] text-[#B91C1C]'}`}>
                {template.is_active ? 'فعال' : 'متوقف'}
              </span>
            </div>
            <h2 className="text-base font-black text-[var(--text)]">{template.name || `Template #${template.id}`}</h2>
            <p className="mt-2 line-clamp-3 min-h-12 text-sm font-semibold leading-6 text-[var(--text-muted)]">{template.description || 'بدون وصف'}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => run(mutations.duplicateTemplate.mutateAsync(template.id), 'تم نسخ القالب')}>
                <Copy size={15} />
                نسخ
              </Button>
              {template.is_active ? (
                <Button variant="ghost" size="sm" onClick={() => run(mutations.deactivateTemplate.mutateAsync(template.id), 'تم إيقاف القالب')}>
                  <PowerOff size={15} />
                  إيقاف
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => run(mutations.activateTemplate.mutateAsync(template.id), 'تم تفعيل القالب')}>
                  <Power size={15} />
                  تفعيل
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
