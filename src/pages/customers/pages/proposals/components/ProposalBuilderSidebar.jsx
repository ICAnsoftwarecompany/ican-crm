import { CSS } from '@dnd-kit/utilities'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react'

import { Button } from '../../../../../shared/components/ui/Button'
import { cn } from '../../../../../shared/utils/cn'
import { BLOCK_LABELS, PROPOSAL_BLOCK_GROUPS } from '../constants/proposalBlockTypes'

function SortableRow({ id, selected, children, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-start text-xs font-bold text-[var(--text)]',
        selected && 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]'
      )}
    >
      <span {...attributes} {...listeners} className="cursor-grab text-[var(--text-light)]">
        <GripVertical size={15} />
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
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
  const sections = content?.sections || []
  const activeSection = sections.find((section) => section.id === selectedSectionId) || sections[0]
  const blocks = activeSection?.blocks || []

  return (
    <aside className="h-[calc(100vh-4.5rem)] w-[300px] shrink-0 overflow-y-auto border-e border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-[var(--text)]">هيكل العرض</h2>
          <p className="text-xs font-semibold text-[var(--text-muted)]">الأقسام والبلوكات</p>
        </div>
        <Button variant="accent" size="icon" onClick={onAddSection} aria-label="إضافة قسم">
          <Plus size={17} />
        </Button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onSectionDragEnd}>
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
                  aria-label="حذف القسم"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <h3 className="mb-3 text-xs font-black text-[var(--text-muted)]">بلوكات القسم المحدد</h3>
        <DndContext collisionDetection={closestCenter} onDragEnd={onBlockDragEnd}>
          <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block) => (
                <SortableRow
                  key={block.id}
                  id={block.id}
                  selected={selected?.type === 'block' && selected.id === block.id}
                  onClick={() => onSelect({ type: 'block', id: block.id, sectionId: activeSection?.id })}
                >
                  {BLOCK_LABELS[block.type] || block.name || block.type}
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <h3 className="mb-3 text-xs font-black text-[var(--text-muted)]">مكتبة البلوكات</h3>
        <div className="space-y-4">
          {PROPOSAL_BLOCK_GROUPS.map((group) => (
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
