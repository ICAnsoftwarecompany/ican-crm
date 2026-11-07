import { Link } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { ArrowRight, Copy, FileSignature, Power, PowerOff, Plus, Info, PencilRuler, GitBranch, FilePlus2, Layers, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { Button } from '../../../../shared/components/ui/Button'
import { useProposalTemplateMutations, useProposalTemplates } from '../../../../features/proposals'

export function CustomerProposalTemplatesPage() {
  const { t, i18n } = useTranslation()
  const ar = i18n.language?.startsWith('ar')
  const templatesQuery = useProposalTemplates()
  const mutations = useProposalTemplateMutations()
  const templates = templatesQuery.data || []

  const run = async (promise, message) => {
    await promise
    toast.success(message)
  }


  return (
    <div className="space-y-6">
      <PageToolbar title={t('proposals.templates.pageTitle')} description={t('proposals.templates.pageDescription')}>
        <Link to="/LeadsCenter/proposals">
          <Button variant="outline">
            <ArrowRight size={16} />
            {t('proposals.templates.proposalsLink')}
          </Button>
        </Link>
      </PageToolbar>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><div className="flex items-start gap-2 text-sm text-[var(--text-muted)]"><Info size={18} className="mt-1 shrink-0"/><p>{t('proposals.workspace.templatesHelp')}</p></div><Link to="/LeadsCenter/proposals/templates/new"><Button><Plus size={16}/>{t('proposals.workspace.createTemplate')}</Button></Link></div>

      {templatesQuery.isError && <p role="alert" className="rounded-lg border border-[var(--border)] p-4 text-sm text-red-600">{t('proposals.workspace.loadFailed')}</p>}
      {!templatesQuery.isLoading && !templatesQuery.isError && !templates.length && <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--text-muted)]">{t('proposals.workspace.emptyTemplates')}</div>}
      {templatesQuery.isLoading ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm font-black text-[var(--text-muted)]">
          {t('proposals.wizard.loadingTemplates')}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          
          <article key={template.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--brand-accent)]">
                <FileSignature size={22} />
              </span>
              <span className={`rounded-full px-2 py-1 text-xs font-black ${template.is_active ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FEF2F2] text-[#B91C1C]'}`}>
                {template.is_active ? t('proposals.templates.active') : t('proposals.templates.inactive')}
              </span>
            </div>
            <h2 className="text-base font-black text-[var(--text)]">{template.name || t('proposals.templates.templateFallback', { id: template.id })}</h2>
            <p className="mt-2 line-clamp-3 min-h-12 text-sm font-semibold leading-6 text-[var(--text-muted)]">{template.description || t('proposals.renderer.noDescription')}</p>
            <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]"><Layers size={15}/>{ar ? 'الإصدار الحالي' : 'Current version'}</span>
                {template.current_version?.id ? (
                  <span className="rounded-md bg-[var(--surface)] px-2 py-1 text-xs font-bold text-[var(--text)]">V{template.current_version.version ?? '—'}</span>
                ) : <span className="text-xs font-semibold text-amber-700">{ar ? 'لا يوجد إصدار حالي' : 'No current version'}</span>}
              </div>
              {template.current_version?.id && <p className="mt-2 break-words text-sm font-semibold text-[var(--text)]">{template.current_version.name || (ar ? 'بدون اسم' : 'Unnamed version')}</p>}
              <p className="mt-2 flex items-start gap-1 text-xs leading-5 text-[var(--text-muted)]"><AlertCircle size={14} className="mt-0.5 shrink-0"/>{ar ? 'حالة التصميم غير مؤكدة من بيانات القائمة. افتح إدارة الإصدارات للتحقق قبل إنشاء عرض.' : 'Design validity is not provided by the list API. Check the version before creating a proposal.'}</p>
            </div>
            <Link className="mt-3 block" to={`/LeadsCenter/proposals/templates/${template.id}/builder#versions`}><Button variant="outline" size="sm" className="w-full"><Layers size={16}/>{ar ? 'إدارة الإصدارات' : 'Manage versions'}</Button></Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {template.is_active && template.current_version?.id && <Link to={`/LeadsCenter/proposals?action=new&template_id=${encodeURIComponent(template.id)}`}><Button size="sm"><FilePlus2 size={15}/>{t('proposals.page.newProposal')}</Button></Link>}
              <Link to={`/LeadsCenter/proposals/templates/${template.id}/builder`}><Button variant="outline" size="sm"><PencilRuler size={15}/>{ar ? 'تعديل تصميم الإصدار' : 'Edit version design'}</Button></Link>
              <Link to={`/LeadsCenter/proposals/templates/${template.id}/builder?action=new-version`}><Button variant="outline" size="sm"><GitBranch size={15}/>{t('proposals.templateEditor.newVersion')}</Button></Link>
              <Button variant="outline" size="sm" onClick={() => run(mutations.duplicateTemplate.mutateAsync(template.id), t('proposals.templates.templateDuplicated'))}>
                <Copy size={15} />
                {t('proposals.templates.duplicate')}
              </Button>
              {template.is_active ? (
                <Button variant="ghost" size="sm" onClick={() => run(mutations.deactivateTemplate.mutateAsync(template.id), t('proposals.templates.templateDeactivated'))}>
                  <PowerOff size={15} />
                  {t('proposals.templates.deactivate')}
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => run(mutations.activateTemplate.mutateAsync(template.id), t('proposals.templates.templateActivated'))}>
                  <Power size={15} />
                  {t('proposals.templates.activate')}
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
