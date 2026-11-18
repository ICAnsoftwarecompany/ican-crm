import { useSetupTemplates } from '../service/setup/api/setupApi'
import { resolveCustomerManagementTemplate } from './industryTemplateConfig'

export { CUSTOMER_MANAGEMENT_TEMPLATES, resolveCustomerManagementTemplate } from './industryTemplateConfig'

export function useCustomerManagementTemplate() {
  const query = useSetupTemplates()
  return { ...query, template: resolveCustomerManagementTemplate(query.data?.meta?.active) }
}
