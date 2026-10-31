export function emptyLeadForm(user = {}) {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return { name: '', email: '', phone: '', company: '', agent_id: user?.id ?? '', status_type_id: '', tag_id: '', source: 'manual', linked_type: 'manual', link_date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, automatic_distribution: false, note: '', attributes: [], interesteds: [] }
}

const nullable = (value) => value === '' || value == null ? null : value
const idValue = (value) => nullable(value) == null ? null : Number(value)
export function buildLeadCreatePayload(form, { tenantId, userId }) {
  return {
    tenant_id: tenantId,
    automatic_distribution: Boolean(form.automatic_distribution),
    form_id: null, ad_id: null, campaign_id: null,
    customers: [{
      name: form.name.trim(), phone: form.phone.trim(), email: nullable(form.email.trim()), company: nullable(form.company.trim()), type: 'lead',
      status_type_id: idValue(form.status_type_id), lead_id: null,
      agent_id: form.automatic_distribution ? null : idValue(form.agent_id), tag_id: idValue(form.tag_id),
      source: form.source.trim() || 'manual', linked_type: form.linked_type, linked_by: userId ?? null, link_date: form.link_date,
      attributes: Object.fromEntries(form.attributes.filter((item) => item.key.trim()).map((item) => [item.key.trim(), item.value])),
      interesteds: form.interesteds.filter((item) => item.product_id).map((item) => ({ product_id: Number(item.product_id), note: nullable(item.note.trim()), interest_level: item.interest_level })),
      note: form.note.trim(),
    }],
  }
}
