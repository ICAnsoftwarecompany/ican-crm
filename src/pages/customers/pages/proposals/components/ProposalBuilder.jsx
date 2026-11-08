import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { BadgeDollarSign, Layers, Info, UsersRound } from 'lucide-react'

import {
  useProposalInfo,
  useProposalMutations,
  useProposalOptions,
  useProposalVersions,
} from '../../../../../features/proposals'
import { useProducts } from '../../../../../features/products/hooks/useProducts'
import { Button } from '../../../../../shared/components/ui/Button'
import { createDefaultBlock, createDefaultBuilderContent, createDefaultSection, moveItem, normalizeBuilderContent, buildVersionPayload } from '../utils/proposalBuilderContent'
import { getResponseEntity } from '../utils/proposalPayloads'
import { ProposalBuilderHeader } from './ProposalBuilderHeader'
import { ProposalBuilderSidebar } from './ProposalBuilderSidebar'
import { ProposalCanvas } from './ProposalCanvas'
import { ProposalPreviewDialog } from './ProposalPreviewDialog'
import { ProposalPricingPanel } from './ProposalPricingPanel'
import { ProposalRecipientsPanel } from './ProposalRecipientsPanel'
import { ProposalPropertiesPanel } from './ProposalPropertiesPanel'
import { ProposalVersionsPanel } from './ProposalVersionsPanel'
import { ProposalRenderer } from './renderer/ProposalRenderer'

function getRightTabs(t) {
  return [
    { id: 'pricing', label: t('proposals.builder.tabs.pricing'), icon: BadgeDollarSign },
    { id: 'recipients', label: 'المستلمون', icon: UsersRound },
    { id: 'versions', label: t('proposals.builder.tabs.versions'), icon: Layers },
  ]
}

export function ProposalBuilder({ proposalId }) {
  const { t } = useTranslation()
  const RIGHT_TABS = useMemo(() => getRightTabs(t), [t])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [content, setContent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [selectedVersionId, setSelectedVersionId] = useState(null)
  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [rightTab, setRightTab] = useState('pricing')
  const [pricingFocus, setPricingFocus] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saveState, setSaveState] = useState(t('proposals.builder.saveState.ready'))
  const hydratedVersionRef = useRef(null)
  const saveTimerRef = useRef(null)
  const editRevisionRef = useRef(0)
  const savingRef = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const proposalQuery = useProposalInfo(proposalId)
  const versionsQuery = useProposalVersions(proposalId)
  const optionsQuery = useProposalOptions(proposalId)
  const productsQuery = useProducts()
  const mutations = useProposalMutations()

  useEffect(() => {
    if (searchParams.get('preview') === '1') setIsPreviewOpen(true)
  }, [searchParams])

  const proposal = proposalQuery.data
  const versions = versionsQuery.data || []
  const options = optionsQuery.data || []
  const products = productsQuery.data || []

  const currentVersion = useMemo(() => {
    if (!versions.length) return null
    return versions.find((version) => String(version.id) === String(selectedVersionId))
      || versions.find((version) => version.is_current)
      || versions[0]
  }, [selectedVersionId, versions])

  const activeOption = options.find(option => String(option.id) === String(selectedOptionId)) || options[0]
  const activeItems = activeOption?.items || []

  const handleSelect = useCallback((selection) => {
    setSelected(selection)
    const block = selection?.type === 'block' ? content?.sections?.find(section => section.id === selection.sectionId)?.blocks?.find(item => item.id === selection.id) : null
    if (block?.type === 'products' || block?.type === 'pricing') {
      setRightTab('pricing')
      setPricingFocus(true)
    } else {
      setPricingFocus(false)
    }
  }, [content])

  const selectedSectionId = selected?.type === 'block'
    ? selected.sectionId
    : selected?.type === 'section'
      ? selected.id
      : content?.sections?.[0]?.id

  useEffect(() => {
    if (!proposal || isDirty || savingRef.current) return
    if (!currentVersion) {
      const initialContent = createDefaultBuilderContent(proposal, null, t)
      setContent(initialContent)
      setSelected({ type: 'section', id: initialContent.sections[0]?.id })
      setSaveState(t('proposals.builder.saveState.noVersionYet'))
      return
    }

    if (hydratedVersionRef.current === currentVersion.id) return
    const normalized = normalizeBuilderContent(currentVersion.content, proposal, t)
    hydratedVersionRef.current = currentVersion.id
    setContent(normalized)
    setSelected({ type: 'section', id: normalized.sections[0]?.id })
    setSelectedVersionId(currentVersion.id)
    setIsDirty(false)
    setSaveState(t('proposals.builder.saveState.saved'))
  }, [currentVersion, proposal, t, isDirty])

  const updateContent = useCallback((updater) => {
    editRevisionRef.current += 1
    setContent((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setIsDirty(true)
      setSaveState(t('proposals.builder.saveState.unsavedChanges'))
      return next
    })
  }, [t])

  const saveVersion = useCallback(async (nextContent = content) => {
    if (!proposal?.id || !currentVersion?.id || !nextContent || savingRef.current) return
    savingRef.current = true
    setIsSaving(true)
    const revision = editRevisionRef.current
    setSaveState(t('proposals.builder.saveState.saving'))
    try {
      await mutations.updateProposalVersion.mutateAsync({
        proposalId: proposal.id,
        versionId: currentVersion.id,
        payload: buildVersionPayload(currentVersion, proposal, nextContent),
      })
      if (editRevisionRef.current === revision) {
        setIsDirty(false)
        setSaveState(t('proposals.builder.saveState.saved'))
      } else {
        setSaveState(t('proposals.builder.saveState.unsavedChanges'))
      }
    } catch (error) {
      setSaveState(t('proposals.builder.saveState.autoSaveFailed'))
      throw error
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }, [content, currentVersion, mutations.updateProposalVersion, proposal, t])

  const exportProposal = async (format) => {
    if (!content || !currentVersion || isExporting || savingRef.current) return
    // Open the print window synchronously to avoid popup blockers after awaiting save.
    const printWindow = format === 'pdf' ? window.open('', '_blank') : null
    if (format === 'pdf' && !printWindow) {
      toast.error('اسمح بفتح نافذة الطباعة من المتصفح')
      return
    }
    setIsExporting(true)
    try {
      window.clearTimeout(saveTimerRef.current)
      if (isDirty) await saveVersion(content)
      const html = renderToStaticMarkup(
        <ProposalRenderer content={content} proposal={proposal} options={options} products={products} items={activeItems} />
      )
      const title = (proposal.title || 'proposal').replace(/[\\/:*?"<>|]/g, '-')
      const css = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(node => node.outerHTML).join('')
      const documentHtml = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>${title}</title>${css}<style>
        @page { size: A4; margin: 12mm; }
        body { margin: 0; background: white; font-family: Arial, sans-serif; direction: rtl; }
        article { max-width: 100% !important; min-height: 0 !important; box-shadow: none !important; }
        section { break-inside: avoid-page; }
        table { border-collapse: collapse; width: 100%; }
        th,td { border: 1px solid #dce8f3; padding: 7px; }
        img { max-width: 100%; }
      </style></head><body>${html}</body></html>`
      if (format === 'pdf') {
        printWindow.document.open()
        printWindow.document.write(documentHtml)
        printWindow.document.close()
        printWindow.setTimeout(() => { printWindow.focus(); printWindow.print() }, 600)
      } else {
        // Word-compatible HTML document, editable in Microsoft Word.
        const blob = new Blob(['\\ufeff', documentHtml], { type: 'application/msword;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `${title}.doc`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch (error) {
      printWindow?.close()
      toast.error(error?.message || 'تعذر تصدير العرض. تأكد من حفظه أولًا.')
    } finally {
      setIsExporting(false)
    }
  }

  const selectVersionSafely = (versionId) => {
    if (String(versionId) === String(currentVersion?.id)) return
    if (isDirty || savingRef.current) {
      toast.error(t('proposals.templateEditor.saveBeforeSwitch'))
      return
    }
    window.clearTimeout(saveTimerRef.current)
    hydratedVersionRef.current = null
    setSelectedVersionId(versionId)
  }

  useEffect(() => {
    if (!isDirty || !currentVersion?.id || !content) return undefined
    window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveVersion(content).catch(() => setSaveState(t('proposals.builder.saveState.autoSaveFailed')))
    }, 900)
    return () => window.clearTimeout(saveTimerRef.current)
  }, [content, currentVersion?.id, isDirty, saveVersion, t])

  const handleCreateVersion = async () => {
    if (!proposal?.id || isDirty || savingRef.current) {
      toast.error(t('proposals.templateEditor.saveBeforeSwitch'))
      return
    }
    const initialContent = content || createDefaultBuilderContent(proposal, null, t)
    const response = await mutations.createProposalVersion.mutateAsync({
      proposalId: proposal.id,
      payload: buildVersionPayload(null, proposal, initialContent, {
        name: 'Version 1',
        change_note: 'Initial visual builder version',
        is_current: true,
      }),
    })
    const created = getResponseEntity(response)
    if (created?.id) setSelectedVersionId(created.id)
    setIsDirty(false)
    setSaveState(t('proposals.builder.saveState.saved'))
    toast.success(t('proposals.builder.versionCreated'))
  }

  const handleAddSection = () => {
    const section = createDefaultSection({}, t)
    updateContent((prev) => ({ ...prev, sections: [...(prev?.sections || []), section] }))
    setSelected({ type: 'section', id: section.id })
  }

  const handleDeleteSection = (sectionId) => {
    if ((content?.sections || []).length <= 1) {
      toast.error(t('proposals.builder.cannotDeleteLastSection'))
      return
    }
    updateContent((prev) => {
      const sections = prev.sections.filter((section) => section.id !== sectionId)
      setSelected({ type: 'section', id: sections[0]?.id })
      return { ...prev, sections }
    })
  }

  const handleAddBlock = (type, sectionId) => {
    const targetSectionId = sectionId || selectedSectionId || content?.sections?.[0]?.id
    if (!targetSectionId) return
    const block = createDefaultBlock(type, {}, t)
    updateContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (
        section.id === targetSectionId
          ? { ...section, blocks: [...(section.blocks || []), block] }
          : section
      )),
    }))
    setSelected({ type: 'block', id: block.id, sectionId: targetSectionId })
  }

  const handleDeleteBlock = (sectionId, blockId) => {
    updateContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (
        section.id === sectionId
          ? { ...section, blocks: section.blocks.filter((block) => block.id !== blockId) }
          : section
      )),
    }))
    setSelected({ type: 'section', id: sectionId })
  }

  const handleSectionDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    updateContent((prev) => ({ ...prev, sections: moveItem(prev.sections, active.id, over.id) }))
  }

  const handleBlockDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id || !selectedSectionId) return
    updateContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (
        section.id === selectedSectionId
          ? { ...section, blocks: moveItem(section.blocks || [], active.id, over.id) }
          : section
      )),
    }))
  }

  if (proposalQuery.isLoading) {
    return <div className="flex min-h-[70vh] items-center justify-center text-sm font-black text-[var(--text-muted)]">{t('proposals.builder.loadingProposal')}</div>
  }

  if (!proposal) {
    return <div className="p-6 text-sm font-black text-[#EF4444]">{t('proposals.builder.proposalNotFound')}</div>
  }

  return (
    <div className="min-w-0 bg-[var(--brand-bg)] xl:flex xl:h-[calc(100dvh-3.25rem)] xl:min-h-0 xl:flex-col xl:overflow-hidden">
      <div className="flex items-start gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs leading-6 text-[var(--text-muted)]"><Info size={17} className="mt-0.5 shrink-0 text-[var(--brand-accent)]"/><span>{t('proposals.workspace.builderHelp')}</span></div>
      <ProposalBuilderHeader
        proposal={proposal}
        currentVersion={currentVersion}
        saveState={saveState}
        onBack={() => navigate('/LeadsCenter/proposals')}
        onPreview={() => setIsPreviewOpen(true)}
        onCreateVersion={handleCreateVersion}
        onExportPdf={() => exportProposal('pdf')}
        onExportWord={() => exportProposal('word')}
        isExporting={isExporting}
        onSaveNow={() => saveVersion().then(() => { if (!isDirty || editRevisionRef.current === 0) toast.success(t('proposals.builder.saveState.saved')) }).catch(() => toast.error(t('proposals.builder.saveState.autoSaveFailed')))}
        creatingVersion={mutations.createProposalVersion.isPending}
        isSaving={isSaving}
      />

      <div className="grid min-w-0 grid-cols-1 gap-0 xl:min-h-0 xl:flex-1 xl:overflow-hidden xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(280px,340px)]">
        <div className="min-w-0 max-h-[55vh] overflow-y-auto xl:h-full xl:min-h-0 xl:max-h-none">
        <ProposalBuilderSidebar
          content={content}
          selected={selected}
          selectedSectionId={selectedSectionId}
          onSelect={handleSelect}
          onAddSection={handleAddSection}
          onDeleteSection={handleDeleteSection}
          onAddBlock={handleAddBlock}
          onSectionDragEnd={handleSectionDragEnd}
          onBlockDragEnd={handleBlockDragEnd}
          propertiesPanel={<ProposalPropertiesPanel content={content} selected={selected} onChangeContent={updateContent} onDeleteBlock={handleDeleteBlock} />}
        />
        </div>

        <div className="min-w-0 min-h-[540px] xl:h-full xl:min-h-0 xl:overflow-hidden">
        <ProposalCanvas
          content={content}
          proposal={proposal}
          options={options}
          products={products}
          items={activeItems}
          selected={selected}
          onSelect={handleSelect}
        />
        </div>

        <div className="flex min-w-0 min-h-[480px] flex-col overflow-hidden border-s border-[var(--border)] bg-[var(--surface)] xl:h-full xl:min-h-0">
          <div className="grid shrink-0 grid-cols-3 border-b border-[var(--border)]">
            {RIGHT_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRightTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-2 py-3 text-xs font-black ${
                    rightTab === tab.id ? 'bg-[#E8F9FA] text-[#007A80]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {rightTab === 'pricing' ? (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              <ProposalPricingPanel
                proposal={proposal}
                options={options}
                selectedOptionId={selectedOptionId}
                onSelectOption={setSelectedOptionId}
                focusItems={pricingFocus}
              />
            </div>
          ) : null}

          {rightTab === 'recipients' ? (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              <ProposalRecipientsPanel proposalId={proposalId} />
            </div>
          ) : null}

          {rightTab === 'versions' ? (
            <div className="h-[calc(100vh-7.5rem)] overflow-y-auto p-4">
              <ProposalVersionsPanel
                proposal={proposal}
                versions={versions}
                currentVersion={currentVersion}
                content={content}
                onSelectVersion={selectVersionSafely}
                disableVersionActions={isDirty || isSaving}
              />
            </div>
          ) : null}
        </div>
      </div>

      <ProposalPreviewDialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={content}
        proposal={proposal}
        options={options}
        products={products}
        items={activeItems}
      />
    </div>
  )
}
