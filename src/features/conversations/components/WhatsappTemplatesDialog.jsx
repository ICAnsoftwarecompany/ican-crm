import { useEffect, useMemo, useState } from 'react'
import { Check, FileUp, RefreshCw, Send, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { useWhatsappIntegrationMutations, useWhatsappTemplates } from '../../integrations/whatsapp'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { Select } from '../../../shared/components/ui/Select'

const EMPTY_TEMPLATE_FORM = {
  integrationId: '',
  name: '',
  language: 'en_US',
  category: 'MARKETING',
  headerFormat: 'NONE',
  headerText: '',
  headerExample: '',
  headerHandle: '',
  bodyText: '',
  bodyExamples: '',
  footerText: '',
  firstButtonType: '',
  firstButtonText: '',
  firstButtonValue: '',
  secondButtonType: '',
  secondButtonText: '',
  secondButtonValue: '',
}

const EMPTY_SEND_FORM = {
  phone_number_id: '',
  to: '',
  template_name: '',
}

function getEntityId(entity) {
  return entity?.id || entity?.template_id || entity?.whatsapp_template_id || entity?.name
}

function getTemplateName(template) {
  return template?.name || template?.template_name || template?.display_name || `Template #${getEntityId(template) || '-'}`
}

function getTemplateStatus(template) {
  return template?.status || template?.template_status || template?.review_status || (template?.is_active ? 'active' : 'inactive')
}

function getUploadedHandle(response) {
  const data = response?.data?.data || response?.data || response || {}
  return data.header_handle || data.handle || data.media_handle || data.id || ''
}

function buildButton(type, text, value) {
  if (!type || !text) return null
  if (type === 'PHONE_NUMBER') return { type, text, phone_number: value }
  if (type === 'URL') return { type, text, url: value, example: value?.includes('{{1}}') ? ['example'] : undefined }
  return { type, text }
}

function buildTemplatePayload(form) {
  const components = []

  if (form.headerFormat !== 'NONE') {
    const header = { type: 'HEADER', format: form.headerFormat }
    if (form.headerFormat === 'TEXT') {
      header.text = form.headerText
      if (form.headerExample) header.example = { header_text: [form.headerExample] }
    } else if (form.headerHandle) {
      header.example = { header_handle: [form.headerHandle] }
    }
    components.push(header)
  }

  components.push({
    type: 'BODY',
    text: form.bodyText,
    example: form.bodyExamples
      ? { body_text: [form.bodyExamples.split(',').map((item) => item.trim()).filter(Boolean)] }
      : undefined,
  })

  if (form.footerText.trim()) {
    components.push({ type: 'FOOTER', text: form.footerText.trim() })
  }

  const buttons = [
    buildButton(form.firstButtonType, form.firstButtonText, form.firstButtonValue),
    buildButton(form.secondButtonType, form.secondButtonText, form.secondButtonValue),
  ].filter(Boolean)

  if (buttons.length) components.push({ type: 'BUTTONS', buttons })

  return {
    name: form.name.trim(),
    language: form.language,
    category: form.category,
    components: components.filter(Boolean),
  }
}

function fillFormFromTemplate(template) {
  const components = template?.components || template?.data?.components || []
  const header = components.find((component) => component.type === 'HEADER') || {}
  const body = components.find((component) => component.type === 'BODY') || {}
  const footer = components.find((component) => component.type === 'FOOTER') || {}
  const buttons = components.find((component) => component.type === 'BUTTONS')?.buttons || []

  return {
    ...EMPTY_TEMPLATE_FORM,
    integrationId: template?.integration_id || template?.integrationId || '',
    name: getTemplateName(template),
    language: template?.language || 'en_US',
    category: template?.category || 'MARKETING',
    headerFormat: header.format || 'NONE',
    headerText: header.text || '',
    headerExample: header.example?.header_text?.[0] || '',
    headerHandle: header.example?.header_handle?.[0] || '',
    bodyText: body.text || '',
    bodyExamples: body.example?.body_text?.[0]?.join(', ') || '',
    footerText: footer.text || '',
    firstButtonType: buttons[0]?.type || '',
    firstButtonText: buttons[0]?.text || '',
    firstButtonValue: buttons[0]?.phone_number || buttons[0]?.url || '',
    secondButtonType: buttons[1]?.type || '',
    secondButtonText: buttons[1]?.text || '',
    secondButtonValue: buttons[1]?.phone_number || buttons[1]?.url || '',
  }
}

function Textarea({ label, value, onChange, rows = 4, placeholder }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-[var(--text)]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] outline-none focus:ring-2 focus:ring-[#25D366]"
      />
    </label>
  )
}

export function WhatsappTemplatesDialog({
  open,
  onClose,
  defaultPhoneNumberId = '',
  defaultTo = '',
  embedded = false,
}) {
  const [activeTab, setActiveTab] = useState('send')
  const [templateForm, setTemplateForm] = useState(EMPTY_TEMPLATE_FORM)
  const [sendForm, setSendForm] = useState({
    ...EMPTY_SEND_FORM,
    phone_number_id: defaultPhoneNumberId,
    to: defaultTo,
  })
  const [mediaFile, setMediaFile] = useState(null)

  const templatesQuery = useWhatsappTemplates(undefined, { enabled: open || embedded })
  const mutations = useWhatsappIntegrationMutations()
  const templates = templatesQuery.data || []

  const templateOptions = useMemo(() => templates.map((template) => ({
    value: getTemplateName(template),
    label: `${getTemplateName(template)} - ${getTemplateStatus(template)}`,
  })), [templates])

  useEffect(() => {
    if (!open && !embedded) return
    setSendForm((form) => ({
      ...form,
      phone_number_id: defaultPhoneNumberId || form.phone_number_id,
      to: defaultTo || form.to,
    }))
  }, [defaultPhoneNumberId, defaultTo, embedded, open])

  if (!open && !embedded) return null

  const updateTemplateForm = (key, value) => setTemplateForm((form) => ({ ...form, [key]: value }))
  const updateSendForm = (key, value) => setSendForm((form) => ({ ...form, [key]: value }))

  const handleUploadMedia = async () => {
    if (!templateForm.integrationId || !mediaFile) {
      toast.error('اختر Integration ID والملف أولا')
      return
    }
    const response = await mutations.uploadTemplateMedia.mutateAsync({
      integrationId: templateForm.integrationId,
      file: mediaFile,
    })
    const handle = getUploadedHandle(response)
    if (handle) updateTemplateForm('headerHandle', handle)
    toast.success('تم رفع الميديا للقالب')
  }

  const handleSaveTemplate = async (event, mode = 'create') => {
    event.preventDefault()
    if (!templateForm.integrationId || !templateForm.name || !templateForm.bodyText) {
      toast.error('Integration ID واسم القالب ونص الرسالة مطلوبين')
      return
    }
    const payload = buildTemplatePayload(templateForm)
    if (mode === 'update') {
      await mutations.updateTemplate.mutateAsync({ integrationId: templateForm.integrationId, payload })
      toast.success('تم تعديل القالب')
      return
    }
    await mutations.createTemplate.mutateAsync({ integrationId: templateForm.integrationId, payload })
    toast.success('تم إرسال القالب للمراجعة')
  }

  const handleSendTemplate = async (event) => {
    event.preventDefault()
    if (!sendForm.phone_number_id || !sendForm.to || !sendForm.template_name) {
      toast.error('Phone Number ID ورقم العميل واسم القالب مطلوبين')
      return
    }
    await mutations.sendTemplateMessage.mutateAsync({
      phone_number_id: sendForm.phone_number_id.trim(),
      to: sendForm.to.trim(),
      template_name: sendForm.template_name.trim(),
    })
    toast.success('تم إرسال أول رسالة WhatsApp')
  }

  return (
    <div
      className={embedded ? 'h-full min-h-[calc(100vh-8rem)]' : 'fixed inset-0 z-[120000] flex items-center justify-center bg-[#0B1220]/55 p-4'}
      dir="rtl"
    >
      <div className={embedded ? 'flex h-full min-h-[calc(100vh-8rem)] w-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm' : 'flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl'}>
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="text-base font-black text-[var(--text)]">قوالب WhatsApp</h2>
            <p className="text-xs font-semibold text-[var(--text-muted)]">إدارة التمبلت وإرسال أول رسالة للعميل</p>
          </div>
          {onClose ? (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="إغلاق">
              <X size={18} />
            </Button>
          ) : null}
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-e border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="mb-4 grid grid-cols-2 gap-2">
              <Button variant={activeTab === 'send' ? 'accent' : 'outline'} size="sm" onClick={() => setActiveTab('send')}>
                <Send size={15} />
                إرسال
              </Button>
              <Button variant={activeTab === 'builder' ? 'accent' : 'outline'} size="sm" onClick={() => setActiveTab('builder')}>
                قالب
              </Button>
            </div>

            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-black text-[var(--text-muted)]">القوالب الموجودة</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => templatesQuery.refetch()} aria-label="تحديث">
                <RefreshCw size={14} />
              </Button>
            </div>

            <div className="space-y-2">
              {templatesQuery.isLoading ? (
                <div className="rounded-lg bg-white px-3 py-4 text-center text-xs font-bold text-[var(--text-muted)]">جاري التحميل...</div>
              ) : null}
              {templates.map((template) => {
                const id = getEntityId(template)
                const isActive = Number(template?.is_active) === 1 || template?.is_active === true
                return (
                  <div key={id || getTemplateName(template)} className="rounded-lg border border-[var(--border)] bg-white p-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateForm(fillFormFromTemplate(template))
                        setSendForm((form) => ({ ...form, template_name: getTemplateName(template) }))
                        setActiveTab('builder')
                      }}
                      className="w-full text-start"
                    >
                      <div className="truncate text-sm font-black text-[var(--text)]">{getTemplateName(template)}</div>
                      <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-bold text-[var(--text-muted)]">
                        <span>{template?.language || '-'}</span>
                        <span>{template?.category || '-'}</span>
                        <span>{getTemplateStatus(template)}</span>
                      </div>
                    </button>
                    <div className="mt-3 flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => mutations.syncTemplateStatus.mutate(id)} aria-label="مزامنة الحالة">
                        <RefreshCw size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => mutations.toggleTemplateActive.mutate({ templateId: id, is_active: isActive ? 0 : 1 })}
                        aria-label="تفعيل أو إيقاف"
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#EF4444]"
                        onClick={() => {
                          if (window.confirm('هل تريد حذف هذا القالب؟')) mutations.deleteTemplate.mutate(id)
                        }}
                        aria-label="حذف القالب"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto p-5">
            {activeTab === 'send' ? (
              <form onSubmit={handleSendTemplate} className="mx-auto max-w-2xl space-y-4">
                <div>
                  <h3 className="text-lg font-black text-[var(--text)]">إرسال أول رسالة WhatsApp</h3>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">هذه الرسالة تستخدم template معتمد لبدء المحادثة.</p>
                </div>
                <Input label="Phone Number ID" value={sendForm.phone_number_id} onChange={(event) => updateSendForm('phone_number_id', event.target.value)} dir="ltr" />
                <Input label="رقم العميل" value={sendForm.to} onChange={(event) => updateSendForm('to', event.target.value)} dir="ltr" placeholder="201275886491" />
                <Select
                  label="اسم القالب"
                  value={sendForm.template_name}
                  onChange={(value) => updateSendForm('template_name', value)}
                  options={templateOptions}
                  placeholder="اختر قالب أو اكتب اسمه في الحقل التالي"
                />
                <Input label="اسم القالب يدويا" value={sendForm.template_name} onChange={(event) => updateSendForm('template_name', event.target.value)} dir="ltr" />
                <Button type="submit" loading={mutations.sendTemplateMessage.isPending}>
                  <Send size={16} />
                  إرسال الرسالة
                </Button>
              </form>
            ) : (
              <form onSubmit={(event) => handleSaveTemplate(event, 'create')} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Integration ID" value={templateForm.integrationId} onChange={(event) => updateTemplateForm('integrationId', event.target.value)} dir="ltr" />
                  <Input label="اسم القالب" value={templateForm.name} onChange={(event) => updateTemplateForm('name', event.target.value)} dir="ltr" placeholder="limited_time_offer" />
                  <Select label="اللغة" value={templateForm.language} onChange={(value) => updateTemplateForm('language', value)} options={[{ value: 'en_US', label: 'en_US' }, { value: 'en', label: 'en' }, { value: 'ar', label: 'ar' }]} />
                  <Select label="التصنيف" value={templateForm.category} onChange={(value) => updateTemplateForm('category', value)} options={[{ value: 'MARKETING', label: 'MARKETING' }, { value: 'UTILITY', label: 'UTILITY' }, { value: 'AUTHENTICATION', label: 'AUTHENTICATION' }]} />
                  <Select label="نوع الهيدر" value={templateForm.headerFormat} onChange={(value) => updateTemplateForm('headerFormat', value)} options={[{ value: 'NONE', label: 'بدون' }, { value: 'TEXT', label: 'TEXT' }, { value: 'IMAGE', label: 'IMAGE' }, { value: 'VIDEO', label: 'VIDEO' }, { value: 'DOCUMENT', label: 'DOCUMENT' }]} />
                  {templateForm.headerFormat === 'TEXT' ? (
                    <Input label="نص الهيدر" value={templateForm.headerText} onChange={(event) => updateTemplateForm('headerText', event.target.value)} />
                  ) : null}
                  {templateForm.headerFormat !== 'NONE' && templateForm.headerFormat !== 'TEXT' ? (
                    <div className="space-y-2 md:col-span-2">
                      <Input label="Header Handle" value={templateForm.headerHandle} onChange={(event) => updateTemplateForm('headerHandle', event.target.value)} dir="ltr" />
                      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <input type="file" onChange={(event) => setMediaFile(event.target.files?.[0] || null)} className="text-sm font-bold" />
                        <Button type="button" variant="outline" size="sm" onClick={handleUploadMedia} loading={mutations.uploadTemplateMedia.isPending}>
                          <FileUp size={15} />
                          رفع ميديا
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <Textarea label="نص الرسالة BODY" rows={5} value={templateForm.bodyText} onChange={(value) => updateTemplateForm('bodyText', value)} placeholder="Hi *{{1}}*! ..." />
                <Input label="أمثلة المتغيرات مفصولة بفواصل" value={templateForm.bodyExamples} onChange={(event) => updateTemplateForm('bodyExamples', event.target.value)} placeholder="Ahmed, Package, 800" />
                <Input label="Footer" value={templateForm.footerText} onChange={(event) => updateTemplateForm('footerText', event.target.value)} />

                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((index) => {
                    const prefix = index === 1 ? 'first' : 'second'
                    return (
                      <div key={prefix} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <div className="mb-3 text-xs font-black text-[var(--text-muted)]">زر {index}</div>
                        <Select
                          label="النوع"
                          value={templateForm[`${prefix}ButtonType`]}
                          onChange={(value) => updateTemplateForm(`${prefix}ButtonType`, value)}
                          options={[
                            { value: 'QUICK_REPLY', label: 'QUICK_REPLY' },
                            { value: 'PHONE_NUMBER', label: 'PHONE_NUMBER' },
                            { value: 'URL', label: 'URL' },
                            { value: 'CATALOG', label: 'CATALOG' },
                          ]}
                          placeholder="بدون"
                        />
                        <div className="mt-3 space-y-3">
                          <Input label="النص" value={templateForm[`${prefix}ButtonText`]} onChange={(event) => updateTemplateForm(`${prefix}ButtonText`, event.target.value)} />
                          <Input label="القيمة" value={templateForm[`${prefix}ButtonValue`]} onChange={(event) => updateTemplateForm(`${prefix}ButtonValue`, event.target.value)} dir="ltr" />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" loading={mutations.createTemplate.isPending}>إنشاء قالب</Button>
                  <Button type="button" variant="outline" onClick={(event) => handleSaveTemplate(event, 'update')} loading={mutations.updateTemplate.isPending}>تعديل قالب</Button>
                  <Button type="button" variant="ghost" onClick={() => setTemplateForm(EMPTY_TEMPLATE_FORM)}>تفريغ</Button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
