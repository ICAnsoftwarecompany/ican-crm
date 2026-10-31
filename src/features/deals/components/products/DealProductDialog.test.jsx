// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DealProductDialog } from './DealProductDialog'

const { get, patch } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }))
vi.mock('../../../../services/httpClient', () => ({ default: { get, patch } }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))
afterEach(() => { cleanup(); get.mockReset(); patch.mockReset() })
const details = { quantity: 2, unit_price: 750, discount: 50, package: 'premium', custom: { months: 36 } }
function mount() {
  get.mockResolvedValue({ data: { data: { id: 3, deal_id: 12, product_id: 1, details, product: { id: 1, name: 'Medicine', price: 15 } } } })
  const onClose = vi.fn()
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><DealProductDialog dealId={12} productId={1} onClose={onClose} /></QueryClientProvider>)
  return onClose
}

describe('deal product detail editor', () => {
  it('fetches by product ID and patches edited details without losing arbitrary metadata', async () => {
    patch.mockResolvedValue({ data: { message: 'Updated' } })
    const onClose = mount()
    const input = await screen.findByLabelText('dealWorkspace.products.details.unit_price')
    expect(input.value).toBe('750')
    fireEvent.change(input, { target: { value: '900' } })
    fireEvent.click(screen.getByText('dealWorkspace.settings.save'))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(get).toHaveBeenCalledWith('/api/tenant/deals/12/products/1')
    expect(patch).toHaveBeenCalledWith('/api/tenant/deals/12/products/1', { details: { ...details, unit_price: 900 } })
  })
  it('keeps the edited form open and shows server failures', async () => {
    patch.mockRejectedValue(new Error('Update failed'))
    const onClose = mount()
    await screen.findByLabelText('dealWorkspace.products.details.quantity')
    fireEvent.click(screen.getByText('dealWorkspace.settings.save'))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Update failed')
    expect(onClose).not.toHaveBeenCalled()
  })
})
