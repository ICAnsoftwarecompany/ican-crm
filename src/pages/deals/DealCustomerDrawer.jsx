import { DealWorkspaceLayout } from '../../features/deals'
import { CustomerDetailsDrawer } from '../customers/components/CustomerDetailsDrawer/CustomerDetailsDrawer'

const renderCustomerDrawer = (props) => <CustomerDetailsDrawer {...props} />

/** Page composition bridges the legacy CRM drawer without a feature-to-page import. */
export function DealCustomerDrawerLayout() {
  return <DealWorkspaceLayout renderCustomerDrawer={renderCustomerDrawer} />
}
