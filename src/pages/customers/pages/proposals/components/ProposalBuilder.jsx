import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { BadgeDollarSign, Layers, Settings2 } from 'lucide-react'

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
import { ProposalPropertiesPanel } from './ProposalPropertiesPanel'
import { ProposalVersionsPanel } from './ProposalVersionsPanel'

const RIGHT_TABS = [
  { id: 'properties', label: 'خصائص', icon: Settings2 },
  { id: 'pricing', label: 'أسعار', icon: BadgeDollarSign },
  { id: 'versions', label: 'نسخ', icon: Layers },
]

export function ProposalBuilder({ proposalId }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [content, setContent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [selectedVersionId, setSelectedVersionId] = useState(null)
  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [rightTab, setRightTab] = useState('properties')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saveState, setSaveState] = useState('جاهز')
  const hydratedVersionRef = useRef(null)
  const saveTimerRef = useRef(null)

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

  const selectedSectionId = selected?.type === 'block'
    ? selected.sectionId
    : selected?.type === 'section'
      ? selected.id
      : content?.sections?.[0]?.id

  useEffect(() => {
    if (!proposal) return
    if (!currentVersion) {
      const initialContent = createDefaultBuilderContent(proposal)
      setContent(initialContent)
      setSelected({ type: 'section', id: initialContent.sections[0]?.id })
      setSaveState('لم يتم إنشاء نسخة بعد')
      return
    }

    if (hydratedVersionRef.current === currentVersion.id) return
    const normalized = normalizeBuilderContent(currentVersion.content, proposal)
    hydratedVersionRef.current = currentVersion.id
    setContent(normalized)
    setSelected({ type: 'section', id: normalized.sections[0]?.id })
    setSelectedVersionId(currentVersion.id)
    setIsDirty(false)
    setSaveState('محفوظ')
  }, [currentVersion, proposal])

  const updateContent = useCallback((updater) => {
    setContent((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setIsDirty(true)
      setSaveState('تغييرات غير محفوظة')
      return next
    })
  }, [])

  const saveVersion = useCallback(async (nextContent = content) => {
    if (!proposal?.id || !currentVersion?.id || !nextContent) return
    setSaveState('جار الحفظ...')
    await mutations.updateProposalVersion.mutateAsync({
      proposalId: proposal.id,
      versionId: currentVersion.id,
      payload: buildVersionPayload(currentVersion, proposal, nextContent),
    })
    setIsDirty(false)
    setSaveState('محفوظ')
  }, [content, currentVersion, mutations.updateProposalVersion, proposal])

  useEffect(() => {
    if (!isDirty || !currentVersion?.id || !content) return undefined
    window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveVersion(content).catch(() => setSaveState('تعذر الحفظ التلقائي'))
    }, 900)
    return () => window.clearTimeout(saveTimerRef.current)
  }, [content, currentVersion?.id, isDirty, saveVersion])

  const handleCreateVersion = async () => {
    if (!proposal?.id) return
    const initialContent = content || createDefaultBuilderContent(proposal)
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
    setSaveState('محفوظ')
    toast.success('تم إنشاء نسخة العرض')
  }

  const handleAddSection = () => {
    const section = createDefaultSection()
    updateContent((prev) => ({ ...prev, sections: [...(prev?.sections || []), section] }))
    setSelected({ type: 'section', id: section.id })
  }

  const handleDeleteSection = (sectionId) => {
    if ((content?.sections || []).length <= 1) {
      toast.error('لا يمكن حذف آخر قسم في العرض')
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
    const block = createDefaultBlock(type)
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
    return <div className="flex min-h-[70vh] items-center justify-center text-sm font-black text-[var(--text-muted)]">جاري تحميل العرض...</div>
  }

  if (!proposal) {
    return <div className="p-6 text-sm font-black text-[#EF4444]">لم يتم العثور على العرض.</div>
  }

  return (
    <div className="min-h-screen bg-[#EEF4FA]" dir="rtl">
      <ProposalBuilderHeader
        proposal={proposal}
        currentVersion={currentVersion}
        saveState={saveState}
        onBack={() => navigate('/customers/proposals')}
        onPreview={() => setIsPreviewOpen(true)}
        onCreateVersion={handleCreateVersion}
        onSaveNow={() => saveVersion().then(() => toast.success('تم الحفظ'))}
        creatingVersion={mutations.createProposalVersion.isPending}
      />

      <div className="flex">
        <ProposalBuilderSidebar
          content={content}
          selected={selected}
          selectedSectionId={selectedSectionId}
          onSelect={setSelected}
          onAddSection={handleAddSection}
          onDeleteSection={handleDeleteSection}
          onAddBlock={handleAddBlock}
          onSectionDragEnd={handleSectionDragEnd}
          onBlockDragEnd={handleBlockDragEnd}
        />

        <ProposalCanvas
          content={content}
          proposal={proposal}
          options={options}
          products={products}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="h-[calc(100vh-4.5rem)] w-[360px] shrink-0 overflow-hidden border-s border-[var(--border)] bg-[var(--surface)]">
          <div className="grid grid-cols-3 border-b border-[var(--border)]">
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

          {rightTab === 'properties' ? (
            <ProposalPropertiesPanel
              content={content}
              selected={selected}
              onChangeContent={updateContent}
              onDeleteBlock={handleDeleteBlock}
            />
          ) : null}

          {rightTab === 'pricing' ? (
            <div className="h-[calc(100vh-7.5rem)] overflow-y-auto p-4">
              <ProposalPricingPanel
                proposal={proposal}
                options={options}
                selectedOptionId={selectedOptionId}
                onSelectOption={setSelectedOptionId}
              />
            </div>
          ) : null}

          {rightTab === 'versions' ? (
            <div className="h-[calc(100vh-7.5rem)] overflow-y-auto p-4">
              <ProposalVersionsPanel
                proposal={proposal}
                versions={versions}
                currentVersion={currentVersion}
                content={content}
                onSelectVersion={(versionId) => {
                  hydratedVersionRef.current = null
                  setSelectedVersionId(versionId)
                }}
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
      />
    </div>
  )
}
