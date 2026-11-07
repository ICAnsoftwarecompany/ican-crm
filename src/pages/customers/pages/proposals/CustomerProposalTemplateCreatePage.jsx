import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowRight, Eye, Save } from 'lucide-react'
import { useProposalTemplateMutations } from '../../../../features/proposals'
import { Button } from '../../../../shared/components/ui/Button'
import { ProposalBuilderSidebar } from './components/ProposalBuilderSidebar'
import { ProposalCanvas } from './components/ProposalCanvas'
import { ProposalPropertiesPanel } from './components/ProposalPropertiesPanel'
import { createDefaultBlock, createDefaultBuilderContent, createDefaultSection, moveItem } from './utils/proposalBuilderContent'
import { getEntityId, getResponseEntity } from './utils/proposalPayloads'

const slugify = (name) => name.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

/** The form and visual editor share a single unsaved draft until Save is pressed. */
export function CustomerProposalTemplateCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const mutations = useProposalTemplateMutations()
  const [form, setForm] = useState({ name: '', description: '', category: '' })
  const [content, setContent] = useState(() => createDefaultBuilderContent({ title: '' }, null, t))
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  // Preserve IDs across partial failures so retry resumes rather than creating duplicates.
  const progress = useRef({ templateId: null, versionId: null, builderSaved: false, published: false })
  const selectedSectionId = selected?.type === 'block' ? selected.sectionId : selected?.id || content.sections[0]?.id
  const change = (update) => setContent(old => typeof update === 'function' ? update(old) : update)
  const addSection = () => {
    const section = createDefaultSection({}, t)
    change(old => ({ ...old, sections: [...old.sections, section] }))
    setSelected({ type: 'section', id: section.id })
  }
  const deleteSection = id => {
    if (content.sections.length <= 1) return toast.error(t('proposals.builder.cannotDeleteLastSection'))
    change(old => ({ ...old, sections: old.sections.filter(section => section.id !== id) }))
    setSelected({ type: 'section', id: content.sections.find(section => section.id !== id)?.id })
  }
  const addBlock = (type, sectionId) => {
    const id = sectionId || selectedSectionId
    const block = createDefaultBlock(type, {}, t)
    change(old => ({ ...old, sections: old.sections.map(section => section.id === id ? { ...section, blocks: [...section.blocks, block] } : section) }))
    setSelected({ type: 'block', id: block.id, sectionId: id })
  }
  const deleteBlock = (sectionId, blockId) => {
    change(old => ({ ...old, sections: old.sections.map(section => section.id === sectionId ? { ...section, blocks: section.blocks.filter(block => block.id !== blockId) } : section) }))
    setSelected({ type: 'section', id: sectionId })
  }
  const reorderSections = ({ active, over }) => {
    if (over && active.id !== over.id) change(old => ({ ...old, sections: moveItem(old.sections, active.id, over.id) }))
  }
  const reorderBlocks = ({ active, over }) => {
    if (over && active.id !== over.id) change(old => ({ ...old, sections: old.sections.map(section => section.id === selectedSectionId ? { ...section, blocks: moveItem(section.blocks, active.id, over.id) } : section) }))
  }
  const save = async () => {
    if (saving || !form.name.trim()) return
    setSaving(true)
    const state = progress.current
    const snapshot = { ...content, title: form.name.trim() }
    try {
      if (!state.templateId) {
        const response = await mutations.createTemplate.mutateAsync({
          ...form, name: form.name.trim(), slug: slugify(form.name), is_active: false,
        })
        state.templateId = getEntityId(getResponseEntity(response))
        if (!state.templateId) throw new Error('Template creation returned no ID')
      }
      if (!state.versionId) {
        const response = await mutations.createTemplateVersion.mutateAsync({
          templateId: state.templateId,
          payload: { name: 'Version 1', content: snapshot, settings: snapshot.settings, design: snapshot.design, is_current: false },
        })
        state.versionId = getEntityId(getResponseEntity(response))
        if (!state.versionId) throw new Error('Version creation returned no ID')
      }
      await mutations.updateVersionBuilder.mutateAsync({
        versionId: state.versionId,
        payload: { content: snapshot, settings: snapshot.settings, design: snapshot.design },
      })
      state.builderSaved = true
      if (!state.published) {
        await mutations.setCurrentVersion.mutateAsync(state.versionId)
        state.published = true
      }
      await mutations.activateTemplate.mutateAsync(state.templateId)
      toast.success(t('proposals.workspace.created'))
      navigate('/LeadsCenter/proposals/templates')
    } catch {
      toast.error(t('proposals.workspace.createFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-w-0 space-y-4 bg-[var(--surface-2)] pb-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center gap-3">
          <Link to="/LeadsCenter/proposals/templates" aria-label={t('proposals.templateEditor.back')}><ArrowRight size={20}/></Link>
          <div><h1 className="font-bold text-[var(--text)]">{t('proposals.workspace.createTemplate')}</h1><p className="text-sm text-[var(--text-muted)]">{t('proposals.templateEditor.help')}</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview(value => !value)} disabled={saving}><Eye size={16}/>{t('proposals.templateEditor.preview')}</Button>
          <Button onClick={save} disabled={saving || !form.name.trim()}><Save size={16}/>{saving ? t('proposals.templateEditor.loading') : t('proposals.workspace.saveTemplate')}</Button>
        </div>
      </header>
      <div className="mx-4 grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">{t('proposals.workspace.templateName')}<input required disabled={saving || Boolean(progress.current.templateId)} value={form.name} onChange={event => setForm(old => ({ ...old, name: event.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"/></label>
        <label className="space-y-1 text-sm">{t('proposals.workspace.templateCategory')}<input disabled={saving || Boolean(progress.current.templateId)} value={form.category} onChange={event => setForm(old => ({ ...old, category: event.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"/></label>
        <label className="space-y-1 text-sm md:col-span-2">{t('proposals.workspace.templateDescription')}<textarea disabled={saving || Boolean(progress.current.templateId)} value={form.description} onChange={event => setForm(old => ({ ...old, description: event.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"/></label>
      </div>
      <div className="mx-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text-muted)]">{t('proposals.templateEditor.help')}</div>
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row">
        {!preview && <ProposalBuilderSidebar content={content} selected={selected} selectedSectionId={selectedSectionId}
          onSelect={setSelected} onAddSection={addSection} onDeleteSection={deleteSection} onAddBlock={addBlock}
          onSectionDragEnd={reorderSections} onBlockDragEnd={reorderBlocks}/>}
        <ProposalCanvas content={content} proposal={{ title: form.name }} options={[]} products={[]} selected={preview ? null : selected} onSelect={preview ? undefined : setSelected}/>
        {!preview && <ProposalPropertiesPanel content={content} selected={selected} onChangeContent={change} onDeleteBlock={deleteBlock}/>}
      </div>
    </div>
  )
}
