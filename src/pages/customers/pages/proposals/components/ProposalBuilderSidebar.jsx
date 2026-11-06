import { useTranslation } from 'react-i18next'
import { CSS } from '@dnd-kit/utilities'
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react'

import { Button } from '../../../../../shared/components/ui/Button'
import { cn } from '../../../../../shared/utils/cn'
import { getBlockLabel, getProposalBlockGroups } from '../constants/proposalBlockTypes'

function SortableRow({ id, selected, children, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-start text-xs font-bold text-[var(--text)]',
        selected && 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]'
      )}
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none text-[var(--text-light)]" aria-label="Drag to reorder"><GripVertical size={15} /></button>
      <button type="button" onClick={onClick} className="min-w-0 flex-1 truncate text-start">{children}</button>
    </div>
  )
}

export function ProposalBuilderSidebar({
  content,
  selected,
  selectedSectionId,
  onSelect,
  onAddSection,
  onDeleteSection,
  onAddBlock,
  onSectionDragEnd,
  onBlockDragEnd,
}) {
  const { t } = useTranslation()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const sections = content?.sections || []
  const activeSection = sections.find((section) => section.id === selectedSectionId) || sections[0]
  const blocks = activeSection?.blocks || []

  return (
    <aside className="max-h-[70vh] w-full shrink-0 overflow-y-auto xl:h-[calc(100vh-4.5rem)] xl:max-h-none xl:w-[300px] border-e border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-[var(--text)]">{t('proposals.builder.structureTitle')}</h2>
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('proposals.builder.structureSubtitle')}</p>
        </div>
        <Button variant="accent" size="icon" onClick={onAddSection} aria-label={t('proposals.builder.addSection')}>
          <Plus size={17} />
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionDragEnd}>
        <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.id} className="group flex items-center gap-2">
                <SortableRow
                  id={section.id}
                  selected={selected?.type === 'section' && selected.id === section.id}
                  onClick={() => onSelect({ type: 'section', id: section.id })}
                >
                  {section.title}
                  {section.is_visible === false ? <EyeOff size={13} className="inline" /> : null}
                </SortableRow>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={() => onDeleteSection(section.id)}
                  aria-label={t('proposals.builder.deleteSection')}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <h3 className="mb-3 text-xs font-black text-[var(--text-muted)]">{t('proposals.builder.selectedSectionBlocks')}</h3>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onBlockDragEnd}>
          <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block) => (
                <SortableRow
                  key={block.id}
                  id={block.id}
                  selected={selected?.type === 'block' && selected.id === block.id}
                  onClick={() => onSelect({ type: 'block', id: block.id, sectionId: activeSection?.id })}
                >
                  {getBlockLabel(block.type, t) || block.name || block.type}
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <h3 className="mb-3 text-xs font-black text-[var(--text-muted)]">{t('proposals.builder.blockLibrary')}</h3>
        <div className="space-y-4">
          {getProposalBlockGroups(t).map((group) => (
            <div key={group.id}>
              <div className="mb-2 text-[11px] font-black text-[var(--text-light)]">{group.label}</div>
              <div className="grid grid-cols-2 gap-2">
                {group.blocks.map((block) => {
                  const Icon = block.icon
                  return (
                    <button
                      key={block.type}
                      type="button"
                      onClick={() => onAddBlock(block.type, activeSection?.id)}
                      className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-center text-xs font-black text-[var(--text)] transition hover:border-[#00C2CB] hover:bg-[#E8F9FA] hover:text-[#007A80]"
                    >
                      <Icon size={18} />
                      <span>{block.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
