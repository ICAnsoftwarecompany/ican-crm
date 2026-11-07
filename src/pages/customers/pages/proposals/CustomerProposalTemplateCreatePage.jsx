import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowRight, Save } from 'lucide-react'
import { proposalTemplatesApi } from '../../../../features/proposals'
import { Button } from '../../../../shared/components/ui/Button'
import { getEntityId, getResponseEntity } from './utils/proposalPayloads'

const makeSlug = name => {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-|-$/g, '')
  return base || 'template'
}

export function CustomerProposalTemplateCreatePage() {
  const { i18n } = useTranslation()
  const ar = i18n.language?.startsWith('ar')
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', slug: '', description: '', category: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const update = (field, value) => setForm(old => ({ ...old, [field]: value }))
  const create = async event => {
    event.preventDefault()
    if (saving || !form.name.trim()) return
    setSaving(true)
    setError('')
    try {
      const response = await proposalTemplatesApi.createTemplate({
        name: form.name.trim(),
        slug: form.slug.trim() || makeSlug(form.name) + '-' + Date.now(),
        description: form.description.trim(),
        category: form.category.trim(),
        is_active: form.is_active,
      })
      const created = getResponseEntity(response)
      const templateId = getEntityId(created)
      if (!templateId) throw new Error(ar ? 'تم إرسال الطلب لكن الاستجابة لا تحتوي على معرف القالب.' : 'The response did not include a template ID.')
      // The save API creates the first version automatically. The builder loads it by template ID.
      sessionStorage.removeItem('proposal-template-draft')
      toast.success(ar ? 'تم إنشاء القالب. يمكنك الآن تصميم الإصدار الأول.' : 'Template created. You can now design its first version.')
      navigate(`/LeadsCenter/proposals/templates/${templateId}/builder`)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || (ar ? 'تعذر إنشاء القالب' : 'Could not create template')
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }
  const fieldClass = 'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--brand-accent)]'
  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 md:p-8">
      <Link to="/LeadsCenter/proposals/templates" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]"><ArrowRight size={16}/>{ar ? 'العودة للقوالب' : 'Back to templates'}</Link>
      <div>
        <h1 className="text-xl font-bold text-[var(--text)]">{ar ? 'إنشاء قالب جديد' : 'Create a template'}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{ar ? 'أدخل البيانات الأساسية أولًا. بعد إنشاء القالب سيتم فتح البيلدر لتصميم الإصدار الأول.' : 'Enter the basic details first. The builder opens after the template is created.'}</p>
      </div>
      <form onSubmit={create} className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <label className="block space-y-1 text-sm font-semibold">
          <span>{ar ? 'اسم القالب *' : 'Template name *'}</span>
          <input className={fieldClass} required maxLength={255} value={form.name} onChange={e => update('name', e.target.value)} placeholder={ar ? 'مثال: عرض تطوير مواقع' : 'Website development proposal'}/>
        </label>
        <label className="block space-y-1 text-sm font-semibold">
          <span>{ar ? 'الرابط المختصر (Slug)' : 'Slug'}</span>
          <input className={fieldClass} value={form.slug} onChange={e => update('slug', e.target.value)} placeholder={makeSlug(form.name)}/>
          <span className="block text-xs font-normal text-[var(--text-muted)]">{ar ? 'اختياري؛ سيتم توليده تلقائيًا لو تركته فارغًا.' : 'Optional; generated automatically when empty.'}</span>
        </label>
        <label className="block space-y-1 text-sm font-semibold">
          <span>{ar ? 'التصنيف' : 'Category'}</span>
          <input className={fieldClass} value={form.category} onChange={e => update('category', e.target.value)} placeholder={ar ? 'تطوير مواقع' : 'Web development'}/>
        </label>
        <label className="block space-y-1 text-sm font-semibold">
          <span>{ar ? 'الوصف' : 'Description'}</span>
          <textarea className={fieldClass} rows={3} value={form.description} onChange={e => update('description', e.target.value)} placeholder={ar ? 'وصف مختصر للقالب' : 'Short template description'}/>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.is_active} onChange={e => update('is_active', e.target.checked)}/>
          {ar ? 'تفعيل القالب' : 'Activate template'}
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !form.name.trim()}><Save size={16}/>{saving ? (ar ? 'جاري الإنشاء...' : 'Creating...') : (ar ? 'إنشاء والانتقال للبيلدر' : 'Create and open builder')}</Button>
        </div>
      </form>
    </div>
  )
}
