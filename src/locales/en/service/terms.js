/**
 * Default and industry terms. The capabilities manifest maps an entity
 * (customer, case, record, batch) to one of these keys, or sends its own
 * `{ ar, en }` label. Add a term here when a new template needs one.
 */
export default {
  customer: { one: 'Customer', other: 'Customers' },
  case: { one: 'Case', other: 'Cases' },
  record: { one: 'Service record', other: 'Service records' },
  batch: { one: 'Batch', other: 'Batches' },
  ticket: { one: 'Ticket', other: 'Tickets' },
  request: { one: 'Request', other: 'Requests' },
  serviceContract: { one: 'Service contract', other: 'Service contracts' },
  visitBatch: { one: 'Visit batch', other: 'Visit batches' },
  traveler: { one: 'Traveler', other: 'Travelers' },
  booking: { one: 'Booking', other: 'Bookings' },
  tripGroup: { one: 'Trip group', other: 'Trip groups' },
  guardian: { one: 'Guardian', other: 'Guardians' },
  enrollment: { one: 'Enrollment', other: 'Enrollments' },
  merchant: { one: 'Merchant', other: 'Merchants' },
  shipment: { one: 'Shipment', other: 'Shipments' },
  manifest: { one: 'Manifest', other: 'Manifests' },
}
