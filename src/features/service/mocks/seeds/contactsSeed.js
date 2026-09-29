import { buildCustomers } from './casesSeed'

const L = (ar, en) => ({ ar, en })

const ROLES = {
  devices: [['owner', L('صاحب الحساب', 'Account owner')], ['site_contact', L('مسؤول الموقع', 'Site contact')], ['accountant', L('المحاسب', 'Accountant')]],
  tourism: [['traveler', L('مسافر', 'Traveler')], ['companion', L('مرافق', 'Companion')], ['booker', L('صاحب الحجز', 'Booker')]],
  school: [['guardian', L('ولي أمر', 'Guardian')], ['student', L('طالب', 'Student')]],
  shipping: [['operations', L('العمليات', 'Operations')], ['accountant', L('المحاسب', 'Accountant')], ['warehouse', L('المخزن', 'Warehouse')]],
}

export const RELATION_TYPES = [
  { key: 'guardian_of', label: L('ولي أمر', 'Guardian of') },
  { key: 'manager_of', label: L('مدير', 'Manager of') },
  { key: 'spouse_of', label: L('زوج/زوجة', 'Spouse of') },
  { key: 'employee_of', label: L('موظف لدى', 'Employee of') },
]

export function buildContactsSetup(manifest) {
  const roles = ROLES[manifest.template] || ROLES.devices
  return { roles: roles.map(([key, label]) => ({ key, label })), relation_types: RELATION_TYPES }
}

const CHILD_NAMES = ['يوسف', 'مريم', 'آدم', 'ليلى']

/** Primary contact per demo customer; the school template adds students with guardian_of. */
export function buildContacts(manifest) {
  const roles = buildContactsSetup(manifest).roles
  const contacts = []
  buildCustomers(manifest).forEach((customer, index) => {
    const primary = {
      id: `ct-${customer.id}-1`,
      customer_id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: '',
      role_key: roles[0].key,
      is_primary: true,
      relationships: [],
    }
    contacts.push(primary)
    if (manifest.template === 'school' && index < 4) {
      const firstName = customer.name.split(' ')[0]
      ;[0, 1].slice(0, index % 2 === 0 ? 2 : 1).forEach((childIndex) => {
        const child = {
          id: `ct-${customer.id}-${childIndex + 2}`,
          customer_id: customer.id,
          name: `${CHILD_NAMES[(index + childIndex) % CHILD_NAMES.length]} ${firstName}`,
          phone: '',
          email: '',
          role_key: 'student',
          is_primary: false,
          relationships: [],
        }
        contacts.push(child)
        primary.relationships.push({ id: `rel-${child.id}`, relation_type: 'guardian_of', to_contact_id: child.id })
      })
    } else if (roles[1]) {
      contacts.push({
        id: `ct-${customer.id}-2`,
        customer_id: customer.id,
        name: index % 2 ? 'أحمد سمير' : 'رانيا حسين',
        phone: '',
        email: '',
        role_key: roles[1].key,
        is_primary: false,
        relationships: [],
      })
    }
  })
  return contacts
}
