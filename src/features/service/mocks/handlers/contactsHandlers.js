import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildContacts, buildContactsSetup } from '../seeds/contactsSeed'
import { mockId } from '../seeds/seedUtils'

registerSeed('contactsSetup', (manifest) => [buildContactsSetup(manifest)])
registerSeed('contacts', buildContacts)

const setup = () => getCollection('contactsSetup')[0]

function serializeContact(contact) {
  const contacts = getCollection('contacts')
  const role = setup().roles.find((entry) => entry.key === contact.role_key)
  return {
    ...contact,
    role: role ? { key: role.key, label: role.label } : null,
    relationships: contact.relationships.map((relation) => {
      const target = contacts.find((entry) => entry.id === relation.to_contact_id)
      return { id: relation.id, relation_type: relation.relation_type, to_contact: target ? { id: target.id, name: target.name } : null }
    }),
  }
}

/** @type {import('../router').MockRoute[]} */
export const contactsHandlers = [
  { method: 'GET', path: serviceEndpoints.contactsSetup, handler: () => ({ data: setup() }) },
  {
    method: 'GET',
    path: serviceEndpoints.customerContacts(':customerId'),
    handler: ({ params }) => ({
      data: getCollection('contacts')
        .filter((contact) => contact.customer_id === String(params.customerId))
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
        .map(serializeContact),
    }),
  },
  {
    method: 'POST',
    path: serviceEndpoints.customerContacts(':customerId'),
    handler: ({ params, body = {} }) => {
      const errors = {}
      if (!String(body.name || '').trim()) errors.name = ['required']
      if (!setup().roles.some((role) => role.key === body.role_key)) errors.role_key = ['required']
      if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)

      const contacts = getCollection('contacts')
      const contact = {
        id: mockId('ct'),
        customer_id: String(params.customerId),
        name: body.name.trim(),
        phone: body.phone || '',
        email: body.email || '',
        role_key: body.role_key,
        is_primary: !contacts.some((entry) => entry.customer_id === String(params.customerId)),
        relationships: [],
      }
      contacts.push(contact)
      // relation = { from_contact_id, relation_type }: "<from contact> is <relation_type> <new contact>"
      if (body.relation?.from_contact_id && body.relation?.relation_type) {
        const source = contacts.find((entry) => entry.id === body.relation.from_contact_id)
        if (!source) throw notFound('Contact')
        source.relationships.push({ id: mockId('rel'), relation_type: body.relation.relation_type, to_contact_id: contact.id })
      }
      return { status: 201, body: { data: serializeContact(contact) } }
    },
  },
]
