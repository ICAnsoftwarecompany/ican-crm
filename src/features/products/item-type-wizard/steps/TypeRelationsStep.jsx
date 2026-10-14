import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lightbulb, Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { getTemplate } from '../constants/itemTypeTemplates'
import { newTypeRelationRow } from '../utils/itemTypeForm'
import { RelationsStep } from '../../components/create/RelationsStep'
import { QuickServiceDialog } from '../components/QuickServiceDialog'

// How each suggested item is usually sold with the type.
const HINT_INCLUSION = {
  installation: 'included',
  onboarding: 'included',
  bundleItems: 'included',
  maintenanceContract: 'optional',
  travelInsurance: 'optional',
  airportTransfer: 'optional',
  schoolBus: 'optional',
  supportPlan: 'optional',
}

/**
 * Step 5: items every product of this type is sold with (free installation, optional maintenance contract…).
 * Saved on the type as `fulfillment_config.default_relations`; the product wizard copies them into each new product,
 * which then creates them with `POST /products/{id}/relations`.
 */
export function TypeRelationsStep({ wizard }) {
  const { t } = useTranslation()
  const { form, update, errors, choice } = wizard
  const [quick, setQuick] = useState(null) // { name, inclusion } | null
  const hints = getTemplate(choice)?.relationHints || []

  const addCreated = (id) => {
    if (!id) return
    update({ relations: [...form.relations, newTypeRelationRow(quick?.inclusion || 'included', { child_product_id: String(id) })] })
  }

  return (
    <div className="space-y-4">
      {hints.length > 0 && (
        <div className="rounded-lg border border-[var(--ai-border)] bg-[var(--ai-bg)] p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--ai-text)]">
            <Lightbulb size={16} aria-hidden="true" />
            {t('catalogSetup.typeWizard.relations.hintsTitle')}
          </p>
          <div className="flex flex-wrap gap-2">
            {hints.map((hint) => (
              <Button
                key={hint}
                variant="outline"
                size="sm"
                onClick={() => setQuick({ name: t(`catalogSetup.typeWizard.relationHints.${hint}.name`), inclusion: HINT_INCLUSION[hint] || 'included' })}
              >
                <Plus size={14} />
                {t(`catalogSetup.typeWizard.relationHints.${hint}.name`)}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{t('catalogSetup.typeWizard.relations.hintsNote')}</p>
        </div>
      )}

      <RelationsStep rows={form.relations} errors={errors} onChange={(relations) => update({ relations })} />

      <Button variant="ghost" size="sm" onClick={() => setQuick({ name: '', inclusion: 'included' })}>
        <Plus size={14} />
        {t('catalogSetup.typeWizard.relations.newService')}
      </Button>

      <QuickServiceDialog open={Boolean(quick)} suggestedName={quick?.name || ''} onClose={() => setQuick(null)} onSaved={addCreated} />
    </div>
  )
}
