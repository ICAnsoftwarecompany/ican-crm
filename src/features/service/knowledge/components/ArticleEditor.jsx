import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { History, Trash2 } from 'lucide-react'
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
import { ARTICLE_LANGUAGES, ARTICLE_TYPES, ARTICLE_VISIBILITIES } from '../utils/articleMeta'
import { ArticleStateChips, ArticleStatusBadge } from './ArticleBadges'
import { ArticleWorkflowActions } from './ArticleWorkflowActions'
import { ArticleVersionsDrawer } from './ArticleVersionsDrawer'
import { ArticleReader } from './ArticleReader'

const EMPTY = { title: '', body: '', category_id: '', language: 'ar', visibility: 'agent', type: 'article', expires_at: '', reviewer_id: '', tags: [], related_case_type_ids: [] }
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
  const [versions, setVersions] = useState(false)
  const saving = create.isPending || update.isPending || publish.isPending
  const fieldErrors = getServiceFieldErrors(create.error || update.error)
  const errorFor = (name) => (fieldErrors[name] ? t('service.settings.validation.required') : undefined)

  useEffect(() => {
    setValues(article ? { ...EMPTY, ...article, expires_at: article.expires_at ? article.expires_at.slice(0, 10) : '', reviewer_id: article.reviewer_id || '' } : EMPTY)
    setTagsText((article?.tags || []).join(', '))
  }, [article])

  const set = (name) => (next) => setValues((current) => ({ ...current, [name]: next }))
  const payload = () => {
    const { title, body, category_id: categoryId, language, visibility, type, expires_at: expiresAt, reviewer_id: reviewerId, related_case_type_ids: types } = values
    return { title, body, category_id: categoryId || null, language, visibility, type, expires_at: expiresAt ? new Date(`${expiresAt}T23:59:00`).toISOString() : null, reviewer_id: reviewerId || null, related_case_type_ids: types, tags: toTags(tagsText) }
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }

  /** Saves the working copy, then optionally runs a workflow step (publish / submit-review) on it. */
  const save = async ({ andPublish = false, then } = {}) => {
    try {
      let saved = article ? await update.mutateAsync({ id: article.id, ...payload() }) : await create.mutateAsync(payload())
      if (andPublish) saved = await publish.mutateAsync(saved.id)
      if (then) saved = await then(saved)
      toast.success(t(andPublish ? 'service.knowledge.toasts.published' : then ? 'service.knowledge.toasts.submitted' : 'service.knowledge.toasts.saved'))
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
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
              <span className="flex flex-wrap gap-1.5"><ArticleStatusBadge status={article.status} /><ArticleStateChips article={article} /></span>
              <button type="button" className="inline-flex items-center gap-1 hover:text-[var(--text)]" onClick={() => setVersions(true)}><History size={14} aria-hidden="true" />{t('service.knowledge.versionN', { n: article.version })}</button>
            </div>
            {article.review_note && <p className="rounded-md border border-sla-at-risk bg-[var(--surface-2)] p-2 text-xs text-[var(--text)]">{t('service.knowledge.reviewNote', { note: article.review_note })}</p>}
            <p className="text-xs text-[var(--text-muted)]">{t('service.knowledge.statsLine', { views: article.view_count || 0, helpful: article.helpful_count || 0, notHelpful: article.not_helpful_count || 0 })}</p>
          </div>
        )}
        <Select label={t('service.knowledge.fields.category')} value={values.category_id} options={categoryOptions} error={errorFor('category_id')} onChange={set('category_id')} />
        <div className="grid grid-cols-2 gap-3">
          <Select label={t('service.knowledge.fields.language')} value={values.language} options={ARTICLE_LANGUAGES.map((value) => ({ value, label: t(`service.knowledge.languages.${value}`) }))} onChange={(next) => set('language')(next || 'ar')} />
          <Select label={t('service.knowledge.fields.visibility')} value={values.visibility} options={ARTICLE_VISIBILITIES.map((value) => ({ value, label: t(`service.knowledge.visibility.${value}`) }))} onChange={(next) => set('visibility')(next || 'agent')} />
          <Select label={t('service.knowledge.fields.type')} value={values.type} options={ARTICLE_TYPES.map((value) => ({ value, label: t(`service.knowledge.types.${value}`) }))} onChange={(next) => set('type')(next || 'article')} />
          <Input label={t('service.knowledge.fields.expiresAt')} type="date" dir="ltr" value={values.expires_at} onChange={(event) => set('expires_at')(event.target.value)} />
        </div>
        <Select label={t('service.knowledge.fields.reviewer')} placeholder={t('service.knowledge.noReviewer')} value={values.reviewer_id} options={(setup.data?.agents || []).map((agent) => ({ value: agent.id, label: agent.name }))} onChange={set('reviewer_id')} />
        <CheckboxGroupField label={t('service.knowledge.fields.relatedTypes')} hint={t('service.knowledge.fields.relatedTypesHint')} value={values.related_case_type_ids} options={typeOptions} onChange={set('related_case_type_ids')} />
        <Input label={t('service.knowledge.fields.tags')} hint={t('service.knowledge.fields.tagsHint')} dir="auto" value={tagsText} onChange={(event) => setTagsText(event.target.value)} />

        <div className="grid gap-2 border-t border-[var(--border)] pt-3">
          <ArticleWorkflowActions article={article} saving={saving} onSave={save} onPreview={() => setPreview(true)} onSaved={onSaved} />
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
      {article && <ArticleVersionsDrawer article={article} open={versions} onClose={() => setVersions(false)} />}
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
