import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowRight, Eye, Save, HelpCircle, ChevronLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react'
import { useProposalTemplateMutations } from '../../../../features/proposals'
import { Button } from '../../../../shared/components/ui/Button'
import { ProposalBuilderSidebar } from './components/ProposalBuilderSidebar'
import { ProposalCanvas } from './components/ProposalCanvas'
import { ProposalPropertiesPanel } from './components/ProposalPropertiesPanel'
import { createDefaultBlock, createDefaultBuilderContent, createDefaultSection, moveItem } from './utils/proposalBuilderContent'
import { getEntityId, getResponseEntity } from './utils/proposalPayloads'

const slugify = (name) => name.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

const GUIDE = {
  ar: [
    { title: 'بيانات القالب', description: 'اكتب اسم واضح للقالب، مثل عرض سعر خدمات الصيانة. التصنيف يساعدك تميّز القوالب، والوصف يوضح متى تستخدمه.', tips: ['اسم القالب مطلوب للحفظ، والتصنيف والوصف اختياريان.', 'القالب تصميم قابل لإعادة الاستخدام، وليس عرض سعر لعميل بعينه.'] },
    { title: 'الأقسام وترتيب الصفحات', description: 'من القائمة الجانبية أضف قسمًا لكل جزء من العرض: غلاف، نطاق العمل، الأسعار، والشروط. اسحب القسم وأفلته لتغيير ترتيبه.', tips: ['اضغط على القسم لتحديده وتعديل خصائصه.', 'لا يمكن حذف آخر قسم حتى لا يصبح القالب فارغًا.'] },
    { title: 'إضافة البلوكات', description: 'حدد القسم أولًا، ثم أضف البلوك المناسب من القائمة الجانبية. البلوك هو عنصر داخل القسم مثل عنوان أو نص أو صورة.', tips: ['الغلاف والعناوين والنصوص لتنظيم المحتوى.', 'بيانات العميل والشركة تعرض معلومات ديناميكية عند استخدام القالب.', 'بلوك الأسعار يعرض تفاصيل التسعير، وبلوك الشروط يعرض البنود والالتزامات.', 'التوقيع والأزرار والروابط عناصر إضافية حسب نوع العرض.'] },
    { title: 'تعديل المحتوى والتصميم', description: 'اضغط على أي بلوك في القائمة أو المعاينة، ثم عدّل إعداداته من لوحة الخصائص. يمكنك تغيير النصوص والتنسيق والظهور وفق الخيارات المتاحة.', tips: ['حدد البلوك الصحيح قبل التعديل.', 'اسحب البلوكات داخل القسم لإعادة ترتيبها.', 'راجع الأسعار والشروط قبل نشر القالب.'] },
    { title: 'المعاينة والحفظ', description: 'اضغط معاينة لمراجعة شكل القالب، ثم حفظ القالب. الحفظ ينشئ القالب وإصداره الأول وينشر الإصدار ويفعّل القالب للاستخدام.', tips: ['تأكد من الاسم، ترتيب الأقسام، ووجود بلوكات الأسعار والشروط عند الحاجة.', 'يمكنك لاحقًا فتح القالب للتعديل أو إنشاء إصدار جديد.', 'إذا فشل الحفظ ستظهر رسالة خطأ، ويمكن إعادة المحاولة.'] },
  ],
  en: [
    { title: 'Template details', description: 'Give the template a recognizable name. Category helps organize templates and description explains when to use it.', tips: ['Name is required; category and description are optional.', 'A template is reusable and not tied to one customer.'] },
    { title: 'Sections and order', description: 'Add sections from the sidebar for cover, scope, pricing and terms. Drag sections to change their order.', tips: ['Select a section to edit its properties.', 'At least one section must remain.'] },
    { title: 'Add blocks', description: 'Select a section, then add blocks such as headings, text, images, customer info, pricing, terms and signatures.', tips: ['Use headings and text to structure content.', 'Customer and company blocks use dynamic information.', 'Pricing and terms blocks are important for commercial offers.', 'Buttons, links and signatures are optional.'] },
    { title: 'Edit and design', description: 'Select a block in the sidebar or canvas and edit it in the properties panel.', tips: ['Select the correct block before editing.', 'Drag blocks within their section to reorder.', 'Review pricing and terms before publishing.'] },
    { title: 'Preview and save', description: 'Preview the design and then save. Saving creates the template and first version, publishes it and activates the template.', tips: ['Check the name, section order, pricing and terms.', 'You can edit or create new versions later.', 'If saving fails, an error appears and you can retry.'] },
  ],
}

/** The form and visual editor share a single unsaved draft until Save is pressed. */
export function CustomerProposalTemplateCreatePage() {
  const { t, i18n } = useTranslation()
  const [guideOpen, setGuideOpen] = useState(true)
  const [guideStep, setGuideStep] = useState(0)
  const guide = GUIDE[i18n.language?.startsWith('ar') ? 'ar' : 'en']
  const guideText = i18n.language?.startsWith('ar') ? { help: 'دليل إنشاء القالب', step: 'الخطوة', previous: 'السابق', next: 'التالي', finish: 'إنهاء الدليل', close: 'إخفاء الدليل', name: 'اسم القالب الذي سيظهر في مكتبة القوالب', category: 'تصنيف اختياري لتجميع القوالب المتشابهة', description: 'وصف اختياري يشرح استخدام القالب' } : { help: 'Template guide', step: 'Step', previous: 'Previous', next: 'Next', finish: 'Finish guide', close: 'Hide guide', name: 'Name shown in the template library', category: 'Optional grouping for similar templates', description: 'Optional explanation of when to use this template' }
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setGuideOpen(value => !value)} aria-expanded={guideOpen}><HelpCircle size={16}/>{guideText.help}</Button>
          <Button variant="outline" onClick={() => setPreview(value => !value)} disabled={saving}><Eye size={16}/>{t('proposals.templateEditor.preview')}</Button>
          <Button onClick={save} disabled={saving || !form.name.trim()}><Save size={16}/>{saving ? t('proposals.templateEditor.loading') : t('proposals.workspace.saveTemplate')}</Button>
        </div>
      </header>
      {guideOpen && (
        <section aria-label={guideText.help} className="mx-4 rounded-xl border border-[var(--brand-accent)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]"><HelpCircle size={18}/>{guideText.help} · {guideText.step} {guideStep + 1}/{guide.length}</div>
            <button type="button" onClick={() => setGuideOpen(false)} aria-label={guideText.close} className="rounded p-1 text-[var(--text-muted)]"><X size={18}/></button>
          </div>
          <div className="mt-3 flex gap-1" aria-hidden="true">{guide.map((item, index) => <button key={item.title} type="button" tabIndex={-1} onClick={() => setGuideStep(index)} className={`h-1.5 flex-1 rounded-full ${index <= guideStep ? 'bg-[var(--brand-accent)]' : 'bg-[var(--border)]'}`}/>)}</div>
          <h2 className="mt-4 text-lg font-bold text-[var(--text)]">{guide[guideStep].title}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{guide[guideStep].description}</p>
          <ul className="mt-3 space-y-2">{guide[guideStep].tips.map(tip => <li key={tip} className="flex items-start gap-2 text-sm leading-6 text-[var(--text)]"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[var(--brand-accent)]"/>{tip}</li>)}</ul>
          <div className="mt-4 flex items-center justify-between gap-2">
            <Button variant="outline" disabled={guideStep === 0} onClick={() => setGuideStep(value => value - 1)}><ChevronRight size={15}/>{guideText.previous}</Button>
            <Button onClick={() => guideStep === guide.length - 1 ? setGuideOpen(false) : setGuideStep(value => value + 1)}>{guideStep === guide.length - 1 ? guideText.finish : guideText.next}<ChevronLeft size={15}/></Button>
          </div>
        </section>
      )}
      <div className="mx-4 grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">{t('proposals.workspace.templateName')}<input required disabled={saving || Boolean(progress.current.templateId)} value={form.name} onChange={event => setForm(old => ({ ...old, name: event.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"/><span className="block text-xs leading-5 text-[var(--text-muted)]">{guideText.name}</span></label>
        <label className="space-y-1 text-sm">{t('proposals.workspace.templateCategory')}<input disabled={saving || Boolean(progress.current.templateId)} value={form.category} onChange={event => setForm(old => ({ ...old, category: event.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"/><span className="block text-xs leading-5 text-[var(--text-muted)]">{guideText.category}</span></label>
        <label className="space-y-1 text-sm md:col-span-2">{t('proposals.workspace.templateDescription')}<textarea disabled={saving || Boolean(progress.current.templateId)} value={form.description} onChange={event => setForm(old => ({ ...old, description: event.target.value }))} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"/><span className="block text-xs leading-5 text-[var(--text-muted)]">{guideText.description}</span></label>
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
