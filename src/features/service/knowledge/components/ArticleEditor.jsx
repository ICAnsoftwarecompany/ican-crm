import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Archive, Eye, Send, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { cn } from '../../../../shared/utils/cn'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceErrorMessage, getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useCaseSetup } from '../../cases/hooks/useCases'
import { useResourceList } from '../../settings/api/settingsApi'
import { kbCategoriesResource } from '../../settings/resources/communicationResources'
import { CheckboxGroupField, TEXTAREA_CLASS } from '../../settings/components/fields/ResourceField'
import { useKbMutations } from '../api/knowledgeApi'
import { ARTICLE_LANGUAGES, ARTICLE_VISIBILITIES } from '../utils/articleMeta'
import { ArticleStatusBadge } from './ArticleBadges'
import { ArticleReader } from './ArticleReader'

const EMPTY = { title: '', body: '', category_id: '', language: 'ar', visibility: 'agent', tags: [], related_case_type_ids: [] }
const toTags = (value) => String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean)

/**
 * Create / edit an article. Saving keeps the current status (new = draft);
 * publishing saves first, then calls publish. Archive = status archived.
 */
export function ArticleEditor({ article, onSaved, onDeleted }) {
  const { t, i18n } = useTranslation()
  const categories = useResourceList(kbCategoriesResource)
  const setup = useCaseSetup()
  const { create, update, publish, remove } = useKbMutations()
  const [values, setValues] = useState(EMPTY)
  const [tagsText, setTagsText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [preview, setPreview] = useState(false)
  const saving = create.isPending || update.isPending || publish.isPending
  const fieldErrors = getServiceFieldErrors(create.error || update.error)
  const errorFor = (name) => (fieldErrors[name] ? t('service.settings.validation.required') : undefined)

  useEffect(() => {
    setValues(article ? { ...EMPTY, ...article } : EMPTY)
    setTagsText((article?.tags || []).join(', '))
  }, [article])

  const set = (name) => (next) => setValues((current) => ({ ...current, [name]: next }))
  const payload = () => {
    const { title, body, category_id: categoryId, language, visibility, related_case_type_ids: types } = values
    return { title, body, category_id: categoryId || null, language, visibility, related_case_type_ids: types, tags: toTags(tagsText) }
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }

  const save = async ({ andPublish = false, status } = {}) => {
    try {
      const body = status ? { ...payload(), status } : payload()
      let saved = article ? await update.mutateAsync({ id: article.id, ...body }) : await create.mutateAsync(body)
      if (andPublish) saved = await publish.mutateAsync(saved.id)
      toast.success(t(andPublish ? 'service.knowledge.toasts.published' : 'service.knowledge.toasts.saved'))
      onSaved?.(saved)
    } catch (error) {
      onError(error)
    }
  }

  const categoryOptions = (categories.data || []).map((category) => ({ value: category.id, label: localizeLabel(category.label, i18n.language, category.id) }))
  const typeOptions = (setup.data?.case_types || []).map((type) => ({ value: type.id, label: localizeLabel(type.label, i18n.language, type.key) }))

  return (
    <form
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
    >
      <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <Input label={t('service.knowledge.fields.title')} dir="auto" lang={values.language} value={values.title} error={errorFor('title')} onChange={(event) => set('title')(event.target.value)} />
        <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
          {t('service.knowledge.fields.body')}
          <textarea
            dir="auto"
            lang={values.language}
            className={cn(TEXTAREA_CLASS, 'min-h-[360px] font-normal leading-7')}
            value={values.body}
            onChange={(event) => set('body')(event.target.value)}
          />
          {errorFor('body') && <span className="text-xs font-normal text-status-lost">{errorFor('body')}</span>}
        </label>
      </section>

      <aside className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        {article && (
          <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <ArticleStatusBadge status={article.status} />
            <span dir="ltr">v{article.version}</span>
          </div>
        )}
        <Select label={t('service.knowledge.fields.category')} value={values.category_id} options={categoryOptions} error={errorFor('category_id')} onChange={set('category_id')} />
        <div className="grid grid-cols-2 gap-3">
          <Select label={t('service.knowledge.fields.language')} value={values.language} options={ARTICLE_LANGUAGES.map((value) => ({ value, label: t(`service.knowledge.languages.${value}`) }))} onChange={(next) => set('language')(next || 'ar')} />
          <Select label={t('service.knowledge.fields.visibility')} value={values.visibility} options={ARTICLE_VISIBILITIES.map((value) => ({ value, label: t(`service.knowledge.visibility.${value}`) }))} onChange={(next) => set('visibility')(next || 'agent')} />
        </div>
        <CheckboxGroupField label={t('service.knowledge.fields.relatedTypes')} hint={t('service.knowledge.fields.relatedTypesHint')} value={values.related_case_type_ids} options={typeOptions} onChange={set('related_case_type_ids')} />
        <Input label={t('service.knowledge.fields.tags')} hint={t('service.knowledge.fields.tagsHint')} dir="auto" value={tagsText} onChange={(event) => setTagsText(event.target.value)} />

        <div className="grid gap-2 border-t border-[var(--border)] pt-3">
          <Button type="submit" loading={saving}>{t('service.knowledge.actions.save')}</Button>
          {article?.status !== 'published' && (
            <Button type="button" variant="outline" disabled={saving} onClick={() => save({ andPublish: true })}>
              <Send size={16} aria-hidden="true" className="rtl:-scale-x-100" />
              {t('service.knowledge.actions.publish')}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => setPreview(true)}>
            <Eye size={16} aria-hidden="true" />
            {t('service.knowledge.actions.preview')}
          </Button>
          {article && article.status !== 'archived' && (
            <Button type="button" variant="ghost" disabled={saving} onClick={() => save({ status: 'archived' })}>
              <Archive size={16} aria-hidden="true" />
              {t('service.knowledge.actions.archive')}
            </Button>
          )}
          {article && (
            <Button type="button" variant="ghost" className="text-status-lost" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} aria-hidden="true" />
              {t('service.knowledge.actions.delete')}
            </Button>
          )}
        </div>
      </aside>

      <AppDrawer open={preview} onClose={() => setPreview(false)} title={t('service.knowledge.actions.preview')} size="md" pushPage={false}>
        <ArticleReader article={{ ...article, ...payload(), status: article?.status || 'draft', category: categories.data?.find((category) => category.id === values.category_id) }} />
      </AppDrawer>
      <ConfirmDialog
        isOpen={confirmDelete}
        type="danger"
        loading={remove.isPending}
        title={t('service.knowledge.deleteTitle')}
        message={t('service.knowledge.deleteMessage')}
        confirmText={t('service.knowledge.actions.delete')}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          remove.mutate(article.id, {
            onSuccess: () => {
              toast.success(t('service.knowledge.toasts.deleted'))
              onDeleted?.()
            },
            onError,
          })
        }
      />
    </form>
  )
}
