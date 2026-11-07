import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowRight, Eye, Save, GripVertical } from 'lucide-react'
import { useProposalTemplateMutations } from '../../../../features/proposals'
import { Button } from '../../../../shared/components/ui/Button'
import { ProposalBuilderSidebar, TemplateHelp } from './components/ProposalBuilderSidebar'
import { ProposalCanvas } from './components/ProposalCanvas'
import { ProposalPropertiesPanel } from './components/ProposalPropertiesPanel'
import { createDefaultBlock, createDefaultBuilderContent, createDefaultSection, moveItem } from './utils/proposalBuilderContent'
import { getEntityId, getResponseEntity } from './utils/proposalPayloads'

const slugify = (name) => name.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

/** The form and visual editor share a single unsaved draft until Save is pressed. */
export function CustomerProposalTemplateCreatePage() {
  const { t, i18n } = useTranslation()
  const ar = i18n.language?.startsWith('ar')
  const help = ar ? {
    name: 'اسم القالب الذي يظهر في المكتبة ويمكن إعادة استخدامه مع عملاء مختلفين. مطلوب للحفظ.',
    category: 'تصنيف اختياري لتنظيم القوالب، مثل صيانة أو خدمات أو منتجات.',
    description: 'وصف داخلي يشرح الغرض من القالب ومتى تستخدمه.',
    preview: 'اعرض القالب كما سيظهر دون أدوات التحرير، ثم ارجع للتعديل.',
    save: 'يحفظ القالب مع الأقسام والبلوكات والتصميم، وينشئ الإصدار الأول ويفعّله للاستخدام.',
  } : {
    name: 'Reusable template name shown in the library. Required to save.',
    category: 'Optional category for organizing templates.',
    description: 'Internal explanation of when to use this template.',
    preview: 'See the template without editing controls.',
    save: 'Save the template, sections, blocks and design, create its first version and activate it.',
  }
  const navigate = useNavigate()
  const mutations = useProposalTemplateMutations()
  const [form, setForm] = useState({ name: '', description: '', category: '' })
  const [content, setContent] = useState(() => createDefaultBuilderContent({ title: '' }, null, t))
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [panelWidths, setPanelWidths] = useState({ left: 290, right: 340 })
  const [wideLayout, setWideLayout] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1280)
  const workspaceRef = useRef(null)
  useEffect(() => {
    const check = () => setWideLayout(window.innerWidth >= 1280)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const startResize = (side, event) => {
    if (event.button !== 0) return
    event.preventDefault()
    const startX = event.clientX
    const initial = panelWidths[side]
    const rtl = document.documentElement.dir === 'rtl'
    const sign = (side === 'left' ? 1 : -1) * (rtl ? -1 : 1)
    const onMove = move => {
      const width = workspaceRef.current?.clientWidth || window.innerWidth
      setPanelWidths(old => ({ ...old, [side]: Math.max(220, Math.min(Math.min(520, width * 0.36), initial + (move.clientX - startX) * sign)) }))
    }
    const stop = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', stop) }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', stop)
  }
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
        <div className="flex flex-wrap gap-2">
          <TemplateHelp enabled description={help.preview}/>
          <Button variant="outline" onClick={() => setPreview(value => !value)} disabled={saving}><Eye size={16}/>{t('proposals.templateEditor.preview')}</Button>
          <TemplateHelp enabled description={help.save}/>
          <Button onClick={save} disabled={saving || !form.name.trim()}><Save size={16}/>{saving ? t('proposals.templateEditor.loading') : t('proposals.workspace.saveTemplate')}</Button>
        </div>
      </header>
      <div className="mx-4 grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm"><span className="inline-flex items-center gap-1">{t('proposals.workspace.templateName')}<TemplateHelp enabled description={help.name}/></span><input required disabled={saving || Boolean(progress.current.templateId)} value={form.name} onChange={event => setForm(old => ({ ...old, name: event.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"/></label>
        <label className="space-y-1 text-sm"><span className="inline-flex items-center gap-1">{t('proposals.workspace.templateCategory')}<TemplateHelp enabled description={help.category}/></span><input disabled={saving || Boolean(progress.current.templateId)} value={form.category} onChange={event => setForm(old => ({ ...old, category: event.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"/></label>
        <label className="space-y-1 text-sm md:col-span-2"><span className="inline-flex items-center gap-1">{t('proposals.workspace.templateDescription')}<TemplateHelp enabled description={help.description}/></span><textarea disabled={saving || Boolean(progress.current.templateId)} value={form.description} onChange={event => setForm(old => ({ ...old, description: event.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"/></label>
      </div>
      <div className="mx-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text-muted)]">{t('proposals.templateEditor.help')}</div>
      <div ref={workspaceRef} className="mx-2 min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] sm:mx-4"
        style={wideLayout && !preview ? { display: 'grid', gridTemplateColumns: `${panelWidths.left}px 8px minmax(0, 1fr) 8px ${panelWidths.right}px`, height: 'min(76vh, 900px)', minHeight: 480 } : undefined}>
        {!preview && (
          <div className={wideLayout ? 'min-h-0 min-w-0 overflow-hidden' : 'h-72 min-w-0 overflow-hidden border-b border-[var(--border)] sm:h-80'}>
            <ProposalBuilderSidebar guide content={content} selected={selected} selectedSectionId={selectedSectionId}
              onSelect={setSelected} onAddSection={addSection} onDeleteSection={deleteSection} onAddBlock={addBlock}
              onSectionDragEnd={reorderSections} onBlockDragEnd={reorderBlocks}/>
          </div>
        )}
        {wideLayout && !preview && <div role="separator" aria-label={ar ? 'تغيير عرض قائمة البلوكات' : 'Resize block sidebar'} aria-orientation="vertical"
          onPointerDown={event => startResize('left', event)}
          className="flex cursor-col-resize items-center justify-center bg-[var(--surface-2)] hover:bg-[var(--border)]"><GripVertical size={14}/></div>}
        <div className={wideLayout ? 'min-h-0 min-w-0 overflow-y-auto overscroll-contain' : 'min-w-0 overflow-y-auto overscroll-contain'} style={{ height: wideLayout ? '100%' : 'min(70vh, 760px)', minHeight: 320 }}>
          <ProposalCanvas content={content} proposal={{ title: form.name }} options={[]} products={[]} selected={preview ? null : selected} onSelect={preview ? undefined : setSelected}/>
        </div>
        {wideLayout && !preview && <div role="separator" aria-label={ar ? 'تغيير عرض الخصائص' : 'Resize properties sidebar'} aria-orientation="vertical"
          onPointerDown={event => startResize('right', event)}
          className="flex cursor-col-resize items-center justify-center bg-[var(--surface-2)] hover:bg-[var(--border)]"><GripVertical size={14}/></div>}
        {!preview && (
          <div className={wideLayout ? 'min-h-0 min-w-0 overflow-hidden' : 'h-80 min-w-0 overflow-hidden border-t border-[var(--border)] sm:h-96'}>
            <ProposalPropertiesPanel guide content={content} selected={selected} onChangeContent={change} onDeleteBlock={deleteBlock}/>
          </div>
        )}
      </div>
    </div>
  )
}
