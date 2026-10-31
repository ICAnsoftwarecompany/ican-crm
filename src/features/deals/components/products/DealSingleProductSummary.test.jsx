// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DealSingleProductSummary, dealSummaryImages } from './DealSingleProductSummary'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key, i18n: { language: 'en' } }) }))
afterEach(cleanup)

it('shows product details, zero-valued fields and images from both entities', () => {
  render(<DealSingleProductSummary deal={{ name: 'Tower deal', image: '/deal.jpg' }} product={{ name: 'Air conditioner', kind: 'product', image: '/product.jpg', code: 'PR-1', price: 750, is_stock_tracked: true, stock_quantity: 0, details: { quantity: 2, discount: 0, notes: 'Special delivery' } }} />)
  expect(screen.getByRole('heading', { name: 'Air conditioner' })).toBeTruthy()
  expect(screen.getByText('PR-1')).toBeTruthy()
  expect(screen.getByText('2')).toBeTruthy()
  expect(screen.getByText(/Special delivery/)).toBeTruthy()
  expect(screen.getByAltText('Tower deal').getAttribute('src')).toBe('/deal.jpg')
  const image = screen.getByAltText('Air conditioner')
  expect(image.closest('a').getAttribute('target')).toBe('_blank')
  fireEvent.error(image)
  expect(screen.queryByAltText('Air conditioner')).toBeNull()
})

it('handles services with no media or stock and does not invent images', () => {
  render(<DealSingleProductSummary deal={{ name: 'Service deal' }} product={{ name: 'Consultation', kind: 'service', description: 'A consultation', stock_quantity: 20, is_stock_tracked: true }} />)
  expect(screen.getByText('dealWorkspace.products.singleSummary.service')).toBeTruthy()
  expect(screen.queryAllByRole('img')).toHaveLength(0)
  expect(screen.queryByText('20')).toBeNull()
})

it('deduplicates returned image URLs and ignores missing media', () => {
  expect(dealSummaryImages({ image: '/one.jpg', images: [{ url: '/one.jpg' }, '/two.jpg', null, {}] })).toEqual(['/one.jpg', '/two.jpg'])
  expect(dealSummaryImages({})).toEqual([])
})
