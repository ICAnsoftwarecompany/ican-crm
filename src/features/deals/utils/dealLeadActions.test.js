import { expect, it, vi } from 'vitest'
vi.mock('../../customers', async () => import('../../customers/utils/customerRowContextActions'))
import { buildDealLeadActions, dealDrawerActionOverrides, dealLeadCustomer, dealLeadPath } from './dealLeadActions'
const t = (key) => key
const lead = { id: 101, leadId: 15, customerId: 70, name: 'Ahmed', status: 'open' }
const handlers = () => Object.fromEntries(['onSchedule', 'onFollowUp', 'onInterest', 'onWon', 'onLost', 'onOpen', 'onOpenPage'].map((name) => [name, vi.fn()]))
it('provides native drawer action overrides without changing deal behavior', () => {
  const actions = handlers()
  const overrides = dealDrawerActionOverrides(lead, actions, t)
  expect(Object.keys(overrides)).toEqual(['status', 'won', 'lost', 'meeting', 'call', 'follow-up', 'interest'])
  overrides.won.onClick()
  expect(actions.onWon).toHaveBeenCalledWith(lead)
  expect(overrides.status).toBeNull()
  expect(dealDrawerActionOverrides({ ...lead, status: 'won' }, actions, t).won.disabled).toBe(true)
})
it('keeps CRM/customer IDs separate from deal-lead IDs and uses a distinct route', () => {
  expect(dealLeadPath(1, 101)).toBe('/deals/1/leads/101')
  const customer = dealLeadCustomer(lead)
  expect(customer.id).toBe(70)
  expect(customer.lead_id).toBe(15)
  expect(customer.lead.id).toBe(15)
  expect(dealLeadCustomer({ id: 101 }).lead.id).toBeUndefined()
})
it('offers the shared task action in both context menu and drawer', () => {
  const actions = { ...handlers(), onAddTask: vi.fn() }
  buildDealLeadActions(lead, actions, t).find((item) => item.id === 'customers-row-add-task').onClick()
  expect(actions.onAddTask).toHaveBeenCalledWith(lead)
  expect(dealDrawerActionOverrides(lead, actions, t).task.label).toBe('customers.leadTasks.add')
})
it('offers won/lost first and the same meetings/calls/follow-up/interests as CRM', () => {
  const actions = handlers()
  const items = buildDealLeadActions(lead, actions, t, { selection: true })
  expect(items.slice(0, 2).map((item) => item.id)).toEqual(['customers-row-mark-won', 'customers-row-mark-lost'])
  items.find((item) => item.id === 'customers-row-add-follow-up').onClick()
  items.find((item) => item.id === 'customers-row-mark-won').onClick()
  expect(actions.onFollowUp).toHaveBeenCalledWith(lead)
  expect(actions.onWon).toHaveBeenCalledWith(lead)
  expect(items.find((item) => item.id === 'customers-row-toggle-selection')).toBeTruthy()
  expect(items.every((item) => item.layout === 'tiles')).toBe(true)
})
it('disables closing closed leads and CRM actions with missing CRM IDs', () => {
  const items = buildDealLeadActions({ ...lead, status: 'won', leadId: undefined }, handlers(), t)
  expect(items.find((item) => item.id === 'customers-row-mark-won').disabled).toBe(true)
  expect(items.find((item) => item.id === 'customers-row-add-interest').disabled).toBe(true)
  expect(items.some((item) => item.id === 'customers-row-toggle-selection')).toBe(false)
})
