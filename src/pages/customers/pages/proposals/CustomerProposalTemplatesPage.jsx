import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Copy, FileSignature, Power, PowerOff, Plus, Info, PencilRuler } from 'lucide-react'
import { toast } from 'sonner'

import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { Button } from '../../../../shared/components/ui/Button'
import { useProposalTemplateMutations, useProposalTemplates } from '../../../../features/proposals'

export function CustomerProposalTemplatesPage() {
  const { t } = useTranslation()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category: '' })
  const templatesQuery = useProposalTemplates()
  const mutations = useProposalTemplateMutations()
  const templates = templatesQuery.data || []

  const run = async (promise, message) => {
    await promise
    toast.success(message)
  }

  const create = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) return
    try {
      await mutations.createTemplate.mutateAsync({ ...form, name: form.name.trim(), slug: form.name.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now(), is_active: false })
      toast.success(t('proposals.workspace.created'))
      setShowCreate(false)
      setForm({ name: '', description: '', category: '' })
    } catch { toast.error(t('proposals.workspace.createFailed')) }
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

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><div className="flex items-start gap-2 text-sm text-[var(--text-muted)]"><Info size={18} className="mt-1 shrink-0"/><p>{t('proposals.workspace.templatesHelp')}</p></div><Button onClick={() => setShowCreate(v => !v)}><Plus size={16}/>{t('proposals.workspace.createTemplate')}</Button></div>
      {showCreate && <form onSubmit={create} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 md:grid-cols-2"><label className="space-y-1 text-sm text-[var(--text)]">{t('proposals.workspace.templateName')}<input required value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]"/></label><label className="space-y-1 text-sm text-[var(--text)]">{t('proposals.workspace.templateCategory')}<input value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value}))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]"/></label><label className="space-y-1 text-sm text-[var(--text)] md:col-span-2">{t('proposals.workspace.templateDescription')}<textarea value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]"/></label><div className="flex gap-2 md:col-span-2"><Button type="submit" disabled={mutations.createTemplate.isPending}>{t('proposals.workspace.saveTemplate')}</Button><Button type="button" variant="outline" onClick={()=>setShowCreate(false)}>{t('proposals.workspace.cancel')}</Button></div></form>}
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
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link to={`/LeadsCenter/proposals/templates/${template.id}/builder`}><Button size="sm"><PencilRuler size={15}/>{t('proposals.templateEditor.edit')}</Button></Link>
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
