import { useTranslation } from 'react-i18next'
import { Wand2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { FULFILLMENT_CREATES, SERVICE_MODELS } from '../../constants/catalogOptions'
import { suggestCode } from '../utils/itemTypeWizard'
import { CheckboxField, KindBadge, TextAreaField, useOptions } from '../../components/common/catalogUi'
import { HelpField } from '../../components/common/HelpTip'

/** Step 2: name, code, description, service model, what a sale creates, status. */
export function BasicsStep({ wizard }) {
  const { t } = useTranslation()
  const { form, update, errors, mode } = wizard
  const createsOptions = useOptions('creates', FULFILLMENT_CREATES)
  const modelOptions = SERVICE_MODELS.map((code) => ({ value: code, label: `${code} — ${t(`catalog.options.serviceModels.${code}`)}` }))
  const fieldError = (key) => (errors[key] ? t(`catalog.validation.${errors[key]}`) : undefined)
  const suggestion = suggestCode(form.name)
  const help = (key) => ({ title: t(`catalogSetup.typeWizard.help.${key}.title`), text: t(`catalogSetup.typeWizard.help.${key}.text`) })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
        {t('catalogSetup.typeWizard.basics.kindIs')} <KindBadge kind={form.kind} />
        {mode === 'edit' && <span className="text-xs">({t('catalogSetup.typeWizard.basics.kindLocked')})</span>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <HelpField {...help('name')}>
          <Input
            label={t('catalog.itemTypes.fields.name')}
            value={form.name}
            placeholder={t(`catalogSetup.typeWizard.basics.namePlaceholder.${form.kind}`)}
            error={fieldError('name')}
            onChange={(event) => update({ name: event.target.value })}
          />
        </HelpField>
        <HelpField {...help('code')}>
          <Input
            label={t('catalog.itemTypes.fields.code')}
            value={form.code}
            dir="ltr"
            placeholder="appliance"
            disabled={mode === 'edit'}
            error={fieldError('code')}
            hint={t('catalog.itemTypes.codeHint')}
            onChange={(event) => update({ code: event.target.value.toLowerCase().replace(/\s+/g, '_') })}
          />
          {mode === 'create' && !form.code && suggestion && (
            <Button variant="ghost" size="sm" className="mt-1" onClick={() => update({ code: suggestion })}>
              <Wand2 size={14} />
              {t('catalogSetup.typeWizard.basics.useCode', { code: suggestion })}
            </Button>
          )}
        </HelpField>
      </div>

      <HelpField {...help('description')}>
        <TextAreaField label={t('catalog.itemTypes.fields.description')} value={form.description} rows={2} onChange={(value) => update({ description: value })} />
      </HelpField>

      <div className="grid gap-4 md:grid-cols-2">
        <HelpField
          title={help('serviceModel').title}
          text={form.service_model ? t(`catalogSetup.typeWizard.serviceModels.${form.service_model}`) : help('serviceModel').text}
        >
          <Select
            label={t('catalog.itemTypes.fields.serviceModel')}
            value={form.service_model}
            placeholder={t('catalog.common.none')}
            options={modelOptions}
            onChange={(value) => update({ service_model: value })}
          />
        </HelpField>
        <HelpField
          title={help('creates').title}
          text={form.fulfillment_creates ? t(`catalogSetup.typeWizard.creates.${form.fulfillment_creates}`) : help('creates').text}
        >
          <Select
            label={t('catalog.itemTypes.fields.fulfillmentCreates')}
            value={form.fulfillment_creates}
            placeholder={t('catalog.common.none')}
            options={createsOptions}
            onChange={(value) => update({ fulfillment_creates: value })}
          />
        </HelpField>
      </div>

      <HelpField {...help('status')}>
        <CheckboxField label={t('catalog.common.active')} hint={t('catalogSetup.typeWizard.basics.statusHint')} checked={form.status} onChange={(value) => update({ status: value })} />
      </HelpField>
    </div>
  )
}
