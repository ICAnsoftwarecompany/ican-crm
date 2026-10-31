// @vitest-environment jsdom
import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DealStageTabs, NO_DEAL_STAGE, hasDealStage } from './DealStageTabs'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
afterEach(cleanup)

it('shows all, unstaged and real stages with counts and selectable filters', () => {
  const onChange = vi.fn()
  render(<DealStageTabs stages={[{ id: 43, name: 'New' }]} leads={[{ stageId: null }, { stageId: 43 }, { stageId: '43' }]} value={NO_DEAL_STAGE} onChange={onChange} />)
  const unstaged = screen.getByRole('button', { name: 'dealWorkspace.pipeline.noStage 1' })
  expect(unstaged.getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: 'New 2' }))
  expect(onChange).toHaveBeenCalledWith(43)
  fireEvent.click(screen.getByRole('button', { name: 'dealWorkspace.pipeline.allStages 3' }))
  expect(onChange).toHaveBeenCalledWith('')
})

it('only treats missing stage IDs as unstaged', () => {
  expect(hasDealStage({})).toBe(false)
  expect(hasDealStage({ stageId: '' })).toBe(false)
  expect(hasDealStage({ stageId: 43 })).toBe(true)
})
