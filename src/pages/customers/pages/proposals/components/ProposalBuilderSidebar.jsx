import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { CSS } from '@dnd-kit/utilities'
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { EyeOff, GripVertical, Plus, Trash2, CircleHelp } from 'lucide-react'

import { Button } from '../../../../../shared/components/ui/Button'
import { cn } from '../../../../../shared/utils/cn'
import { getBlockLabel, getProposalBlockGroups } from '../constants/proposalBlockTypes'

const HELP = {
  ar: {
    addSection: 'أضف قسمًا جديدًا في القالب، مثل الغلاف أو نطاق العمل أو الأسعار أو الشروط.',
    deleteSection: 'يحذف القسم المحدد وكل البلوكات بداخله. لا يمكن حذف آخر قسم.',
    reorder: 'اضغط باستمرار على مقبض السحب ثم اسحب القسم أو البلوك لتغيير ترتيبه.',
    blocks: 'حدد قسمًا أولًا ثم اضغط على نوع البلوك لإضافته داخل هذا القسم.',
    cover: 'غلاف العرض: عنوان رئيسي، وصف مختصر وصورة اختيارية.',
    heading: 'عنوان لتقسيم المحتوى، مع اختيار الحجم واللون والمحاذاة.',
    text: 'نص حر لشرح الخدمات أو نطاق العمل أو الملاحظات.',
    image: 'صورة باستخدام رابط مباشر، مع وصف اختياري.',
    button: 'زر يحتوي على نص ورابط يمكن للعميل فتحه.',
    divider: 'خط فاصل بين أجزاء المحتوى.',
    spacer: 'مسافة فارغة لضبط توزيع العناصر.',
    customer_info: 'بيانات العميل تُملأ عند إنشاء عرض سعر من القالب.',
    company_info: 'بيانات شركتك مثل الاسم والبريد والهاتف والعنوان.',
    products: 'قسم لعرض المنتجات أو الخدمات المرتبطة بالعرض.',
    pricing: 'بلوك الأسعار: يعرض تفاصيل التسعير داخل العرض؛ تفاصيل الأسعار تُدار في محرر العرض.',
    terms: 'الشروط والأحكام: اكتب شروط الدفع والتنفيذ والضمان والصلاحية.',
    signature: 'مكان توقيع العميل أو المسؤول، مع الاسم والصفة.',
    page_break: 'فاصل لبدء صفحة جديدة في العرض.',
    video: 'إضافة رابط فيديو مع عنوان.',
    custom: 'عنصر مخصص لعرض عنوان وقيمة.',
    link: 'رابط نصي لصفحة أو ملف خارجي.',
  },
  en: {
    addSection: 'Add a section such as cover, scope, pricing or terms.',
    deleteSection: 'Delete this section and its blocks. The last section cannot be deleted.',
    reorder: 'Drag this handle to change the order of sections or blocks.',
    blocks: 'Select a section, then click a block type to insert it.',
    cover: 'Cover with title, subtitle and optional image.',
    heading: 'Heading with size, color and alignment settings.',
    text: 'Free text for scope, services or notes.',
    image: 'Image URL and optional caption.',
    button: 'Button with a label and destination URL.',
    divider: 'Visual divider between content.',
    spacer: 'Adjustable empty vertical space.',
    customer_info: 'Customer information populated when using the template.',
    company_info: 'Your company name, email, phone and address.',
    products: 'Display products or services.',
    pricing: 'Pricing block; pricing details are managed in the proposal editor.',
    terms: 'Payment, delivery, warranty and validity terms.',
    signature: 'Signature area with signer name and role.',
    page_break: 'Start a new page.',
    video: 'Video link with title.',
    custom: 'Custom label and value.',
    link: 'Text link to a page or file.',
  },
}

export function TemplateHelp({ topic, enabled = false, description }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const ar = i18n.language?.startsWith('ar')
  const help = description || HELP[ar ? 'ar' : 'en'][topic] || (ar ? 'اضغط على العنصر لتعديل إعداداته.' : 'Click to edit this element.')
  useEffect(() => {
    if (!open) return
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = Math.min(280, window.innerWidth - 24)
      setPosition({
        left: Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2)),
        top: rect.bottom + 8,
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])
  if (!enabled) return null
  return (
    <span className="inline-flex shrink-0 items-center">
      <button ref={triggerRef} type="button" aria-label={ar ? 'شرح الخاصية' : 'Explain this feature'} aria-expanded={open}
        onClick={event => { event.preventDefault(); event.stopPropagation(); setOpen(value => !value) }}
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        className="rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--brand-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)]">
        <CircleHelp size={15}/>
      </button>
      {open && createPortal(
        <div role="tooltip" dir={ar ? 'rtl' : 'ltr'} style={{ position: 'fixed', top: position.top, left: position.left, width: 'min(280px, calc(100vw - 24px))', zIndex: 9999 }}
          className="pointer-events-none rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-start text-xs font-normal leading-6 text-[var(--text)] shadow-xl">{help}</div>,
        document.body
      )}
    </span>
  )
}

function SortableRow({ id, selected, children, onClick, guide = false }) {
  const { t } = useTranslation()
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
      <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none text-[var(--text-light)]" aria-label={t("proposals.dragToReorder")}><GripVertical size={15} /></button>
      <TemplateHelp enabled={guide} topic="reorder" />
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
  guide = false,
  generalDesign = null,
}) {
  const { t } = useTranslation()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const sections = content?.sections || []
  const activeSection = sections.find((section) => section.id === selectedSectionId) || sections[0]
  const blocks = activeSection?.blocks || []

  return (
    <aside className="h-full min-h-0 w-full min-w-0 overflow-y-auto border-e border-[var(--border)] bg-[var(--surface)] p-4">
      {generalDesign && <div className="mb-5">{generalDesign}</div>}
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-[var(--text)]">{t('proposals.builder.structureTitle')}</h2>
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t('proposals.builder.structureSubtitle')}</p>
        </div>
        <TemplateHelp enabled={guide} topic="addSection" />
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
                  guide={guide}
                  selected={selected?.type === 'section' && selected.id === section.id}
                  onClick={() => onSelect({ type: 'section', id: section.id })}
                >
                  {section.title}
                  {section.is_visible === false ? <EyeOff size={13} className="inline" /> : null}
                </SortableRow>
                <TemplateHelp enabled={guide} topic="deleteSection" />
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
                  guide={guide}
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
        <div className="mb-3 flex items-center gap-1"><h3 className="text-xs font-black text-[var(--text-muted)]">{t('proposals.builder.blockLibrary')}</h3><TemplateHelp enabled={guide} topic="blocks" /></div>
        <div className="space-y-4">
          {getProposalBlockGroups(t).map((group) => (
            <div key={group.id}>
              <div className="mb-2 text-[11px] font-black text-[var(--text-light)]">{group.label}</div>
              <div className="grid grid-cols-2 gap-2">
                {group.blocks.map((block) => {
                  const Icon = block.icon
                  return (
                    <div key={block.type} className="relative flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onAddBlock(block.type, activeSection?.id)}
                        className="flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-center text-xs font-black text-[var(--text)] transition hover:border-[#00C2CB] hover:bg-[#E8F9FA] hover:text-[#007A80]"
                      >
                        <Icon size={18} />
                        <span>{block.label}</span>
                      </button>
                    </div>
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
