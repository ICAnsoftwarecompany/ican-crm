import { useTranslation } from 'react-i18next'
import { Badge } from '../../../../shared/components/ui/Badge'
import { getProductUnitMode, getProductUnits } from '../../utils/dealProductMode'

const VARIANTS = { unique: 'purple', units: 'info', service: 'default' }

/** "One piece" / "5 units" / "Service" for a product, from its data (see utils/dealProductMode). */
export function ProductUnitBadge({ product }) {
  const { t } = useTranslation()
  const mode = getProductUnitMode(product)
  const units = getProductUnits(product)
  const label = mode === 'units' && units !== null
    ? t('dealWorkspace.productMode.unitsCount', { count: units })
    : t(`dealWorkspace.productMode.unit.${mode}`)
  return <Badge variant={VARIANTS[mode]}>{label}</Badge>
}
