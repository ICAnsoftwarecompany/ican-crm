import { useTranslation } from 'react-i18next'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { CustomerSelect } from '../../records/components/CustomerSelect'
import { useResourceList } from '../../settings/api/settingsApi'
import { portalPoliciesResource } from '../../settings/resources/portalResources'
import { MEMBERSHIP_TYPES, ORG_ROLES } from '../constants/portalObjects'

/** Customer + membership type (+ B2B role) + policy — what a portal account can see (spec §43.1). */
export function MembershipFields({ value, onChange, errors = {}, fixedCustomer }) {
  const { t, i18n } = useTranslation()
  const policies = useResourceList(portalPoliciesResource)
  const set = (name) => (next) => onChange({ ...value, [name]: next })
  const required = (name) => errors[name] && t('service.settings.validation.required')
  return (
    <>
      <CustomerSelect value={value.customer_id} onChange={set('customer_id')} fixed={fixedCustomer} error={required('customer_id')} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label={t('service.portal.fields.membershipType')} value={value.membership_type} onChange={(type) => onChange({ ...value, membership_type: type, role_id: type === 'organization_member' ? value.role_id || 'operations' : '' })} options={MEMBERSHIP_TYPES.map((type) => ({ value: type, label: t(`service.portal.membershipTypes.${type}`) }))} error={required('membership_type')} />
        {value.membership_type === 'organization_member' && <Select label={t('service.portal.fields.role')} value={value.role_id} onChange={set('role_id')} options={ORG_ROLES.map((role) => ({ value: role, label: t(`service.portal.roles.${role}`) }))} error={required('role_id')} />}
        <Select label={t('service.portal.fields.policy')} value={value.policy_id} onChange={set('policy_id')} options={(policies.data || []).map((policy) => ({ value: policy.id, label: localizeLabel(policy.name, i18n.language, policy.id) }))} error={required('policy_id')} />
      </div>
    </>
  )
}
