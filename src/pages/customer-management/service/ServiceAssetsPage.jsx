import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Cpu } from 'lucide-react'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { AssetDetailView, AssetsWorkspace } from '../../features/service'

/** /service/assets/:assetId? — customer assets and warranty. */
export function ServiceAssetsPage() {
  const { t } = useTranslation()
  const { assetId } = useParams()
  usePageHeader({ title: t('service.hub.title'), icon: Cpu })
  return assetId ? <AssetDetailView assetId={assetId} backTo="/service/assets" /> : <AssetsWorkspace detailPath={(asset) => `/service/assets/${asset.id}`} />
}

export default ServiceAssetsPage
