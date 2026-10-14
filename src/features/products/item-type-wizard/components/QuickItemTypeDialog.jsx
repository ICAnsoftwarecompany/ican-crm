import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useItemTypeMutations, useUnits } from '../../hooks/useCatalogSetup'
import { formatApiError } from '../../utils/apiErrors'
import { getCreatedId } from '../../utils/catalogPayloads'
import { CapabilityChips, FormError } from '../../components/common/catalogUi'
import { templatesForKind } from '../constants/itemTypeTemplates'
import { applyTemplate, blankFormForKind, suggestCode } from '../utils/itemTypeWizard'
import { buildItemTypePayload } from '../utils/itemTypeForm'

/** Code from the name, or a unique one when the name has no latin letters (Arabic names). */
const codeFor = (name, kind) => suggestCode(name) || `${kind}_${Date.now().toString(36)}`

/**
 * Quick item type (2026-10-15): name + optional ready template, saved with one `POST /item-types`, without leaving
 * the product wizard. `onSaved(id)` selects it. "Open full page" hands over to the item type wizard (the caller saves
 * the product as a draft first, then navigates).
 */
export function QuickItemTypeDialog({ open, kind = 'product', onClose, onSaved, onOpenFull }) {
  const { t } = useTranslation()
  const mutations = useItemTypeMutations()
  const unitsQuery = useUnits()
  const templates = templatesForKind(kind)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [error, setError] = useState('')
  const template = templates.find((item) => item.id === templateId) || null

  useEffect(() => {
    if (!open) return
    setName('')
    setCode('')
    setTemplateId('')
    setError('')
  }, [open])

  const preview = useMemo(() => (template ? template.capabilities : []), [template])

  const submit = async () => {
    if (!name.trim()) return setError(t('catalog.validation.nameRequired'))
    const finalCode = (code || codeFor(name, kind)).trim()
    if (!/^[a-z0-9_]+$/.test(finalCode)) return setError(t('catalog.validation.codeFormat'))
    const base = template
      ? applyTemplate(template, { name: name.trim(), description: t(`catalogSetup.templates.${template.id}.description`), units: unitsQuery.data || [] }).form
      : blankFormForKind(kind)
    const payload = buildItemTypePayload({ ...base, name: name.trim(), code: finalCode, kind, status: true }, { mode: 'create' })
    try {
      const id = getCreatedId(await mutations.create.mutateAsync(payload))
      toast.success(t('catalogSetup.quickType.created', { name: name.trim() }))
      onSaved?.(id)
      onClose()
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={mutations.create.isPending}
      title={t(`catalogSetup.quickType.title.${kind === 'service' ? 'service' : 'product'}`)}
      description={t('catalogSetup.quickType.description')}
      submitText={t('catalogSetup.quickType.save')}
    >
      <FormError message={error} />
      <Input
        label={t('catalog.itemTypes.fields.name')}
        value={name}
        autoFocus
        placeholder={t(`catalogSetup.typeWizard.basics.namePlaceholder.${kind}`)}
        onChange={(event) => setName(event.target.value)}
      />
      <Input
        label={t('catalog.itemTypes.fields.code')}
        value={code}
        dir="ltr"
        placeholder={name ? codeFor(name, kind) : 'appliance'}
        hint={t('catalogSetup.quickType.codeHint')}
        onChange={(event) => setCode(event.target.value.toLowerCase().replace(/\s+/g, '_'))}
      />
      {templates.length > 0 && (
        <Select
          label={t('catalogSetup.quickType.template')}
          value={templateId}
          placeholder={t('catalogSetup.typeWizard.templates.manual')}
          options={templates.map((item) => ({ value: item.id, label: t(`catalogSetup.templates.${item.id}.name`) }))}
          onChange={setTemplateId}
        />
      )}
      {template && (
        <div className="rounded-lg bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]">
          <p className="mb-1.5">{t(`catalogSetup.templates.${template.id}.description`)}</p>
          <CapabilityChips capabilities={preview} />
        </div>
      )}
      {onOpenFull && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
          <p className="text-xs text-[var(--text-muted)]">{t('catalogSetup.quickType.fullHint')}</p>
          <Button variant="outline" size="sm" onClick={onOpenFull}>
            <ExternalLink size={14} />
            {t('catalogSetup.quickType.openFull')}
          </Button>
        </div>
      )}
    </FormDialog>
  )
}
