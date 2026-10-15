// @vitest-environment jsdom
// Lost reasons manager (2026-10-15): list, add (JSON POST), turn off (PUT), delete (DELETE after confirm).
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

const list = { data: [{ id: 1, name: 'High cost', code: 'HIGH_COST', description: 'High cost', is_active: true, sort_order: 1 }] }
const get = vi.fn(async () => ({ data: list }))
const post = vi.fn(async () => ({ data: { data: { id: 2 } } }))
const put = vi.fn(async () => ({ data: {} }))
const del = vi.fn(async () => ({ data: {} }))
vi.mock('../../../services/httpClient', () => ({ default: { get: (...a) => get(...a), post: (...a) => post(...a), put: (...a) => put(...a), delete: (...a) => del(...a), patch: vi.fn() } }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key, i18n: { language: 'en' } }), initReactI18next: { type: '3rdParty', init() {} } }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const { LostReasonsManager } = await import('./LostReasonsManager')

afterEach(cleanup)

describe('LostReasonsManager', () => {
  it('adds, turns off and deletes reasons through the definitions API', async () => {
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><LostReasonsManager /></QueryClientProvider>)
    expect(await screen.findByText('High cost')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('customers.lostReasons.namePlaceholder'), { target: { value: 'No budget' } })
    fireEvent.click(screen.getByText('customers.lostReasons.add'))
    await waitFor(() => expect(post).toHaveBeenCalledWith('/api/tenant/definitions/lost-reasons', { name: 'No budget', code: 'NO_BUDGET', description: 'No budget', is_active: true, sort_order: 2 }))

    fireEvent.click(screen.getByLabelText('customers.lostReasons.active'))
    await waitFor(() => expect(put).toHaveBeenCalledWith('/api/tenant/definitions/lost-reasons/1', expect.objectContaining({ is_active: false, code: 'HIGH_COST' })))

    fireEvent.click(screen.getByLabelText('customers.lostReasons.delete'))
    const confirmButtons = await screen.findAllByText('customers.lostReasons.delete')
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    await waitFor(() => expect(del).toHaveBeenCalledWith('/api/tenant/definitions/lost-reasons/1'))
  })
})
