// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DealProductFacts } from './DealProductFacts'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, options) => options?.defaultValue || key, i18n: { language: 'en' } }) }))
afterEach(cleanup)

it('groups key facts in a compact grid while preserving nested and additional data', () => {
  const { container } = render(<DealProductFacts product={{ name: 'AC', image: '/ac.jpg', code: 'PR-2', kind: 'product', price: 750, status: false, stock_quantity: 0, details: { quantity: 2, notes: 'Special' }, capability_values: { warranty: { months: 36 } }, id: 2, created_at: '2026-10-19', custom: 'Retained' }} />)
  expect(screen.getByRole('heading', { name: 'AC' })).toBeTruthy()
  expect(screen.getByText('PR-2').closest('dl').className).toContain('grid')
  expect(screen.getByText('0')).toBeTruthy()
  expect(screen.getByText('dealWorkspace.products.explorer.no')).toBeTruthy()
  expect(screen.getByText('36')).toBeTruthy()
  expect(screen.getByText('Special')).toBeTruthy()
  expect(container.querySelector('details').open).toBe(false)
  expect(screen.getByText('Retained').closest('details')).toBeTruthy()
  fireEvent.error(screen.getByRole('img'))
  expect(screen.queryByRole('img')).toBeNull()
})

it('renders a service with no image and does not add empty sections', () => {
  render(<DealProductFacts product={{ name: 'Consultation', kind: 'service', details: {}, data: null }} />)
  expect(screen.getByText('dealWorkspace.products.explorer.service')).toBeTruthy()
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.queryByText('dealWorkspace.products.explorer.fields.details')).toBeNull()
})
