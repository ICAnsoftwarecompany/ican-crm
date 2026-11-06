import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowRight, Copy, Eye, Save, GitBranch, Plus } from 'lucide-react'
import { useProposalTemplateInfo, useProposalTemplateMutations } from '../../../../features/proposals'
import { Button } from '../../../../shared/components/ui/Button'
import { ProposalBuilderSidebar } from './components/ProposalBuilderSidebar'
import { ProposalPropertiesPanel } from './components/ProposalPropertiesPanel'
import { ProposalCanvas } from './components/ProposalCanvas'
import { createDefaultBlock, createDefaultBuilderContent, createDefaultSection, moveItem, normalizeBuilderContent } from './utils/proposalBuilderContent'
import { getEntityId, getResponseEntity } from './utils/proposalPayloads'
import { getTemplateVersions, getTemplateVersionContent, getCurrentTemplateVersion, getTemplateVersions as extractVersions, verifySavedTemplateContent } from './utils/templateVersionSnapshot'

export function CustomerProposalTemplateBuilderPage() {
  const { templateId } = useParams()
  const { t } = useTranslation()
  const tr = (key) => t('proposals.templateEditor.' + key)
  const query = useProposalTemplateInfo(templateId)
  const mutations = useProposalTemplateMutations()
  const template = query.data
  const versions = useMemo(() => getTemplateVersions(template), [template])
  const [versionId, setVersionId] = useState(null)
  const hydratedKey = useRef(null)
  const editRevision = useRef(0)
  const saving = useRef(false)
  const [content, setContent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState(false)
  const currentVersion = versions.find(v => String(v.id) === String(versionId)) || getCurrentTemplateVersion(template) || versions[0]
  const selectedSectionId = selected?.type === 'block' ? selected.sectionId : selected?.id || content?.sections?.[0]?.id
  const pending = mutations.updateVersionBuilder.isPending || mutations.createTemplateVersion.isPending || mutations.duplicateVersion.isPending || mutations.setCurrentVersion.isPending

  useEffect(() => {
    if (!template) return
    const key = String(template.id) + ':' + String(currentVersion?.id || 'none')
    if (hydratedKey.current === key || dirty || saving.current) return
    hydratedKey.current = key
    const raw = getTemplateVersionContent(currentVersion)
    const next = normalizeBuilderContent(raw, { title: template.name }, t)
    setContent(next)
    setSelected({ type: 'section', id: next.sections[0]?.id })
    setDirty(false)
  }, [template?.id, currentVersion?.id, t, dirty])

  const change = (update) => {
    editRevision.current += 1
    setContent(old => typeof update === 'function' ? update(old) : update)
    setDirty(true)
  }
  const save = async () => {
    if (!currentVersion?.id || !content || saving.current) return
    saving.current = true
    const revision = editRevision.current
    try {
      const savedContent = content
      await mutations.updateVersionBuilder.mutateAsync({ versionId: currentVersion.id, payload: {
        content: savedContent, settings: savedContent.settings, design: savedContent.design,
      } })
      const refreshed = await query.refetch()
      const persisted = extractVersions(refreshed.data).find(version => String(version.id) === String(currentVersion.id))
      if (!persisted || !verifySavedTemplateContent(persisted, savedContent)) {
        toast.error(tr('saveNotVerified'))
        return
      }
      if (editRevision.current === revision) setDirty(false)
      toast.success(tr('saved'))
    } catch { toast.error(tr('saveFailed')) }
    finally { saving.current = false }
  }
  const createVersion = async (duplicate = false) => {
    if (dirty || saving.current || pending) { toast.error(tr('saveBeforeSwitch')); return }
    try {
      const response = duplicate && currentVersion?.id
        ? await mutations.duplicateVersion.mutateAsync(currentVersion.id)
        : await mutations.createTemplateVersion.mutateAsync({ templateId, payload: {
          name: tr('newVersionName'), content: content || createDefaultBuilderContent({ title: template.name }, null, t),
          settings: content?.settings, design: content?.design, is_current: false,
        } })
      const created = getResponseEntity(response)
      const createdId = getEntityId(created)
      if (createdId) {
        hydratedKey.current = null
        setVersionId(createdId)
      }
      await query.refetch()
      toast.success(tr('versionCreated'))
    } catch { toast.error(tr('versionFailed')) }
  }
  const selectVersion = (id) => {
    if (dirty || saving.current || pending) { toast.error(tr('saveBeforeSwitch')); return }
    hydratedKey.current = null
    setVersionId(id)
  }
  const publish = async () => {
    if (dirty || saving.current || pending) { toast.error(tr('saveBeforeSwitch')); return }
    if (!currentVersion?.id || !window.confirm(tr('publishConfirm'))) return
    try {
      await mutations.setCurrentVersion.mutateAsync(currentVersion.id)
      await query.refetch()
      toast.success(tr('published'))
    } catch { toast.error(tr('versionFailed')) }
  }
  const addSection = () => {
    const section = createDefaultSection({}, t)
    change(old => ({ ...old, sections: [...old.sections, section] }))
    setSelected({ type: 'section', id: section.id })
  }
  const deleteSection = id => {
    if (content.sections.length <= 1) return toast.error(t('proposals.builder.cannotDeleteLastSection'))
    change(old => ({ ...old, sections: old.sections.filter(s => s.id !== id) }))
    setSelected({ type: 'section', id: content.sections.find(s => s.id !== id)?.id })
  }
  const addBlock = (type, sectionId) => {
    const id = sectionId || selectedSectionId
    const block = createDefaultBlock(type, {}, t)
    change(old => ({ ...old, sections: old.sections.map(s => s.id === id ? { ...s, blocks: [...s.blocks, block] } : s) }))
    setSelected({ type: 'block', id: block.id, sectionId: id })
  }
  const deleteBlock = (sectionId, blockId) => {
    change(old => ({ ...old, sections: old.sections.map(s => s.id === sectionId ? { ...s, blocks: s.blocks.filter(b => b.id !== blockId) } : s) }))
    setSelected({ type: 'section', id: sectionId })
  }
  const reorderSections = ({ active, over }) => {
    if (over && active.id !== over.id) change(old => ({ ...old, sections: moveItem(old.sections, active.id, over.id) }))
  }
  const reorderBlocks = ({ active, over }) => {
    if (over && active.id !== over.id) change(old => ({ ...old, sections: old.sections.map(s => s.id === selectedSectionId ? { ...s, blocks: moveItem(s.blocks, active.id, over.id) } : s) }))
  }

  if (query.isLoading) return <p className="p-8 text-[var(--text-muted)]">{tr('loading')}</p>
  if (query.isError || !template) return <p role="alert" className="p-8 text-red-600">{tr('loadFailed')}</p>
  return (
    <div className="min-w-0 space-y-3 bg-[var(--surface-2)] pb-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center gap-3">
          <Link to="/LeadsCenter/proposals/templates" aria-label={tr('back')}><ArrowRight size={20}/></Link>
          <div><h1 className="font-bold text-[var(--text)]">{template.name}</h1><p className="text-xs text-[var(--text-muted)]">{tr('subtitle')}</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => createVersion(false)} disabled={pending}><Plus size={15}/>{tr('newVersion')}</Button>
          <Button variant="outline" onClick={() => createVersion(true)} disabled={pending || !currentVersion}><Copy size={15}/>{tr('duplicate')}</Button>
          <Button variant="outline" onClick={() => setPreview(v => !v)}><Eye size={15}/>{tr('preview')}</Button>
          <Button onClick={save} disabled={!dirty || pending || !currentVersion}><Save size={15}/>{tr('save')}</Button>
        </div>
      </header>
      <div className="flex flex-wrap items-center gap-3 px-4">
        <label className="text-sm font-semibold text-[var(--text)]">{tr('versions')}</label>
        <select className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm text-[var(--text)]" value={currentVersion?.id || ''} onChange={e => selectVersion(e.target.value)}>
          {versions.map(v => <option key={v.id} value={v.id}>{v.name || ('#' + v.id)} {v.is_current ? '✓' : ''}</option>)}
        </select>
        {currentVersion?.is_current ? <span className="text-xs text-emerald-600">{tr('current')}</span> : null}
        <Button variant="outline" size="sm" onClick={publish} disabled={pending || !currentVersion || dirty || currentVersion.is_current}><GitBranch size={15}/>{tr('setCurrent')}</Button>
        {dirty && <span className="text-xs text-amber-600">{tr('unsaved')}</span>}
        {!versions.length && <p className="text-sm text-[var(--text-muted)]">{tr('noVersions')}</p>}
      </div>
      <p className="mx-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs leading-6 text-[var(--text-muted)]">{tr('help')}</p>
      {content && <div className="flex min-w-0 flex-col gap-3 xl:flex-row">
        {!preview && <ProposalBuilderSidebar content={content} selected={selected} selectedSectionId={selectedSectionId}
          onSelect={setSelected} onAddSection={addSection} onDeleteSection={deleteSection} onAddBlock={addBlock}
          onSectionDragEnd={reorderSections} onBlockDragEnd={reorderBlocks} />}
        <ProposalCanvas content={content} proposal={{ title: template.name }} options={[]} products={[]} selected={preview ? null : selected} onSelect={preview ? undefined : setSelected} />
        {!preview && <ProposalPropertiesPanel content={content} selected={selected} onChangeContent={change} onDeleteBlock={deleteBlock} />}
      </div>}
    </div>
  )
}
