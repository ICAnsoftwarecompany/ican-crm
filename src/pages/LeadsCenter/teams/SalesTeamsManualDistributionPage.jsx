import { useTranslation } from 'react-i18next'
import { ManualLeadDistributionAction } from '../../features/leads'
import { CustomersPage } from '../customers/CustomersPage'

const selectionToolbar = (context) => <ManualLeadDistributionAction {...context} />

export function SalesTeamsManualDistributionPage() {
  const { t } = useTranslation()
  return <CustomersPage pageTitle={t('salesTeams.manual.title')} tableOnly tableIdOverride="customers-manual-distribution" selectionToolbar={selectionToolbar} />
}
