import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('contacts')
const unwrap = (response) => response.data?.data ?? response.data

/**
 * Contacts = people with a lasting relationship to a customer (spec §24.2).
 * Contact: { id, customer_id, name, phone, email, role: {key,label}|null, is_primary,
 *            relationships: [{ id, relation_type, to_contact: {id,name}|null }] }
 * Create payload: { name, phone?, email?, role_key, relation?: { from_contact_id, relation_type } }
 *   → "<from contact> is <relation_type> the new contact" (e.g. guardian_of a student).
 */
export const contactsApi = {
  list: async (customerId) => unwrap(await api.get(serviceEndpoints.customerContacts(customerId))),
  create: async (customerId, payload) => unwrap(await api.post(serviceEndpoints.customerContacts(customerId), payload)),
  setup: async () => unwrap(await api.get(serviceEndpoints.contactsSetup)),
}

export function useCustomerContacts(customerId) {
  return useQuery({
    queryKey: serviceKeys.contacts(customerId),
    queryFn: () => contactsApi.list(customerId),
    enabled: customerId != null && customerId !== '',
  })
}

export function useContactsSetup() {
  return useQuery({ queryKey: serviceKeys.contactsSetup(), queryFn: contactsApi.setup, staleTime: 5 * 60 * 1000 })
}

export function useCreateContact(customerId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => contactsApi.create(customerId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.contacts(customerId) }),
  })
}
