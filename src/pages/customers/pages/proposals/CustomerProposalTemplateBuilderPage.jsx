import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowRight, Copy, Eye, Save, GitBranch, Plus, Layers, AlertTriangle } from 'lucide-react'
import { useProposalTemplateInfo, useProposalTemplateVersions, useProposalTemplateVersionInfo, useProposalTemplateMutations } from '../../../../features/proposals'
import { Button } from '../../../../shared/components/ui/Button'
import { ProposalBuilderSidebar } from './components/ProposalBuilderSidebar'
import { ProposalPropertiesPanel } from './components/ProposalPropertiesPanel'
import { ProposalCanvas } from './components/ProposalCanvas'
import { createDefaultBlock, createDefaultBuilderContent, createDefaultSection, moveItem, normalizeBuilderContent } from './utils/proposalBuilderContent'
import { getEntityId, getResponseEntity } from './utils/proposalPayloads'
import { getTemplateVersions, getTemplateVersionContent, getCurrentTemplateVersion } from './utils/templateVersionSnapshot'
import { persistTemplateSections } from './utils/persistTemplateSections'

export function CustomerProposalTemplateBuilderPage() {
  const { templateId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const newVersionTriggered = useRef(false)
  const { t, i18n } = useTranslation()
  const ar = i18n.language?.startsWith('ar')
  const tr = (key) => t('proposals.templateEditor.' + key)
  const query = useProposalTemplateInfo(templateId)
  const mutations = useProposalTemplateMutations()
  const template = query.data
  // The backend currently exposes the current version through template/show.
  // Do not call the unavailable versions-list endpoint on initial builder load.
  const versionsQuery = useProposalTemplateVersions(templateId, false)
  const versions = useMemo(() => {
    const embedded = getTemplateVersions(template)
    const listed = versionsQuery.data || []
    const byId = new Map()
    for (const version of [...listed, ...embedded]) {
      if (!version?.id) continue
      const old = byId.get(String(version.id))
      byId.set(String(version.id), old ? { ...version, ...old, content: old.content ?? version.content, sections: old.sections ?? version.sections } : version)
    }
    return [...byId.values()].sort((a, b) => Number(b.version || 0) - Number(a.version || 0))
  }, [template, versionsQuery.data])
  const hasFullVersionList = Array.isArray(template?.versions) || Array.isArray(template?.template_versions) || Array.isArray(template?.data?.versions)
  const [versionId, setVersionId] = useState(null)
  const selectedVersionDetail = useProposalTemplateVersionInfo(versionId, Boolean(versionId) && String(versionId) !== String(template?.current_version?.id))
  const hydratedKey = useRef(null)
  const editRevision = useRef(0)
  const saving = useRef(false)
  const savedSectionsRef = useRef([])
  const [content, setContent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState(false)
  const listedVersion = versions.find(v => String(v.id) === String(versionId)) || getCurrentTemplateVersion(template) || versions[0]
  const detail = selectedVersionDetail.data
  const currentVersion = detail && String(detail.id) === String(listedVersion?.id) ? { ...listedVersion, ...detail } : listedVersion
  const activeVersionId = template?.current_version?.id ?? template?.current_version_id
  const versionHasContent = version => Boolean(getTemplateVersionContent(version)?.sections?.length || version?.sections?.length)
  const selectedSectionId = selected?.type === 'block' ? selected.sectionId : selected?.id || content?.sections?.[0]?.id
  const versionContentUnavailable = !currentVersion?.id
  const pending = mutations.updateVersionBuilder.isPending || mutations.createTemplateVersion.isPending || mutations.duplicateVersion.isPending || mutations.setCurrentVersion.isPending

  useEffect(() => {
    if (!template) return
    const key = String(template.id) + ':' + String(currentVersion?.id || 'none')
    if (hydratedKey.current === key || dirty || saving.current) return
    hydratedKey.current = key
    const raw = getTemplateVersionContent(currentVersion) ?? (currentVersion?.sections ? { sections: currentVersion.sections, settings: currentVersion.settings, styles: currentVersion.styles } : null)
    const next = raw && raw.sections?.length ? normalizeBuilderContent(raw, { title: template.name }, t) : createDefaultBuilderContent({ title: template.name }, null, t)
    savedSectionsRef.current = currentVersion?.sections || []
    setContent(next)
    setSelected(next ? { type: 'section', id: next.sections[0]?.id } : null)
    setDirty(false)
  }, [template?.id, currentVersion?.id, currentVersion?.sections, currentVersion?.content, t, dirty])

  const change = (update) => {
    editRevision.current += 1
    setContent(old => typeof update === 'function' ? update(old) : update)
    setDirty(true)
  }
  const save = async () => {
    if (!currentVersion?.id || !content || versionContentUnavailable || saving.current) return
    saving.current = true
    const revision = editRevision.current
    try {
      const savedContent = await persistTemplateSections(currentVersion.id, content, partial => {
        setContent({ ...partial, sections: [...partial.sections] })
        savedSectionsRef.current = partial.sections
      }, savedSectionsRef.current)
      savedSectionsRef.current = savedContent.sections
      setContent(savedContent)
      await mutations.updateVersionBuilder.mutateAsync({ versionId: currentVersion.id, payload: {
        content: savedContent, settings: savedContent.settings, design: savedContent.design,
      } })
      if (editRevision.current === revision) setDirty(false)
      toast.success(tr('saved'))
    } catch (error) { toast.error(error?.response?.data?.message || error?.message || tr('saveFailed')) }
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
  useEffect(() => {
    if (searchParams.get('action') !== 'new-version' || !content || !template || newVersionTriggered.current || pending || dirty) return
    newVersionTriggered.current = true
    setSearchParams({}, { replace: true })
    // Creating a fresh version is explicit; the existing current version is not modified.
    void createVersion(false)
  // createVersion is intentionally invoked once after hydration.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, content, template, pending, dirty])

  const selectVersion = (id, showPreview = false) => {
    if (dirty || saving.current || pending) { toast.error(tr('saveBeforeSwitch')); return }
    hydratedKey.current = null
    setVersionId(id)
    setPreview(showPreview)
  }
  const publish = async () => {
    if (dirty || saving.current || pending) { toast.error(tr('saveBeforeSwitch')); return }
    if (!currentVersion?.id || versionContentUnavailable || !window.confirm(tr('publishConfirm'))) return
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
          <Button onClick={save} disabled={!dirty || pending || !currentVersion || versionContentUnavailable}><Save size={15}/>{tr('save')}</Button>
        </div>
      </header>
      <section id="versions" className="mx-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="mb-3 flex items-center gap-2"><Layers size={18}/><h2 className="text-sm font-black">{ar ? 'إدارة إصدارات القالب' : 'Template version management'}</h2></div>
        <p className="mb-3 text-xs leading-6 text-[var(--text-muted)]">{ar ? 'اختار الإصدار اللي عايز تعدّل تصميمه. احفظ التعديلات قبل الانتقال لإصدار آخر، واعتمد الإصدار المناسب لاستخدامه في عروض العملاء الجديدة.' : 'Choose the version to edit. Save before switching, and set a valid version as current for new customer proposals.'}</p>
        {!hasFullVersionList && versions.length > 1 && <p className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle size={16} className="shrink-0"/>{ar ? 'الـ API رجّع الإصدار الحالي فقط؛ باقي الإصدارات مش ظاهرة في الاستجابة الحالية.' : 'The API returned only the current version; other versions are not available in this response.'}</p>}
        {selectedVersionDetail.isError && <p role="alert" className="mb-3 text-xs text-amber-700">{ar ? 'تعذر تحميل تفاصيل الإصدار المحدد من الـ API.' : 'Could not load selected version details.'}</p>}
        {versionContentUnavailable && <p className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle size={16} className="shrink-0"/>{ar ? 'الإصدار المحدد لا يحتوي على أقسام تصميم محفوظة في الاستجابة الحالية. لا يمكن عرض أو تعديل التصميم حتى يوفر الـ API تفاصيل هذا الإصدار.' : 'No saved design sections were found in this version response. This version cannot be viewed or edited until its design details are available.'}</p>}
      <div className="mb-4 space-y-2">
        {versionsQuery.isLoading && <p className="text-xs text-[var(--text-muted)]">{ar ? 'جاري تحميل الإصدارات...' : 'Loading versions...'}</p>}
        {versionsQuery.isError && <p role="alert" className="text-xs text-amber-700">{ar ? 'تعذر تحميل قائمة الإصدارات من الخادم؛ المعروض هو المتاح من تفاصيل القالب فقط.' : 'Could not fetch the full version list; showing versions included in template details only.'}</p>}
        {versions.map(version => (
          <div key={version.id} className={`flex flex-wrap items-center gap-2 rounded-lg border p-3 ${String(version.id) === String(currentVersion?.id) ? 'border-[#00C2CB] bg-[var(--surface-2)]' : 'border-[var(--border)]'}`}>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-bold text-[var(--text)]">V{version.version ?? '—'} — {version.name || (ar ? 'بدون اسم' : 'Unnamed')}</p>
              {String(version.id) === String(activeVersionId) && <span className="text-xs font-bold text-emerald-600">{ar ? 'الإصدار الحالي' : 'Current'}</span>}
              {!versionHasContent(version) && <p className="text-xs text-[var(--text-muted)]">{ar ? 'الإصدار بدون أقسام محفوظة بعد — يمكنك تصميمه وحفظه.' : 'No saved sections yet — edit and save this version.'}</p>}
            </div>
            <Button variant="outline" size="sm" disabled={pending} onClick={() => selectVersion(version.id, true)}><Eye size={14}/>{ar ? 'عرض' : 'View'}</Button>
            <Button variant="outline" size="sm" disabled={pending} onClick={() => selectVersion(version.id, false)}><Save size={14}/>{ar ? 'تعديل' : 'Edit'}</Button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-[var(--text)]">{tr('versions')}</label>
        <select className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm text-[var(--text)]" value={currentVersion?.id || ''} onChange={e => selectVersion(e.target.value)}>
          {versions.map(v => <option key={v.id} value={v.id}>{v.name || ('#' + v.id)} {v.is_current ? '✓' : ''}</option>)}
        </select>
        {currentVersion?.is_current ? <span className="text-xs text-emerald-600">{tr('current')}</span> : null}
        <Button variant="outline" size="sm" onClick={publish} disabled={pending || !currentVersion || dirty || currentVersion.is_current || versionContentUnavailable}><GitBranch size={15}/>{tr('setCurrent')}</Button>
        {dirty && <span className="text-xs text-amber-600">{tr('unsaved')}</span>}
        {!versions.length && <p className="text-sm text-[var(--text-muted)]">{tr('noVersions')}</p>}
      </div>
      </section>
      <p className="mx-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs leading-6 text-[var(--text-muted)]">{tr('help')}</p>
      {content && <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(250px,320px)] xl:items-start">
        {!preview && <ProposalBuilderSidebar content={content} selected={selected} selectedSectionId={selectedSectionId}
          onSelect={setSelected} onAddSection={addSection} onDeleteSection={deleteSection} onAddBlock={addBlock}
          onSectionDragEnd={reorderSections} onBlockDragEnd={reorderBlocks} />}
        <div className="min-w-0 xl:min-h-[680px]"><ProposalCanvas content={content} proposal={{ title: template.name }} options={[]} products={[]} selected={preview ? null : selected} onSelect={preview ? undefined : setSelected} /></div>
        {!preview && <ProposalPropertiesPanel content={content} selected={selected} onChangeContent={change} onDeleteBlock={deleteBlock} />}
      </div>}
    </div>
  )
}
