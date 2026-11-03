import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Customer360Layout } from './components/Customer360Layout'

const render = (props = {}) => renderToStaticMarkup(
  <Customer360Layout
    header={<span>Customer header</span>}
    actions={<button type="button">Customer action</button>}
    overview={<span>Customer profile</span>}
    tabs={<nav>Customer tabs</nav>}
    content={<article>Customer activity</article>}
    floatingChats={<div>Customer chats</div>}
    {...props}
  />
)

describe('Customer360Layout', () => {
  it('renders every core section with RTL direction', () => {
    const html = render()
    expect(html).toContain('dir="rtl"')
    for (const value of ['Customer header', 'Customer action', 'Customer profile', 'Customer tabs', 'Customer activity', 'Customer chats']) {
      expect(html).toContain(value)
    }
  })

  it('shows related deals when supplied', () => {
    expect(render({ deals: <span>Deal record</span> })).toContain('Deal record')
  })

  it('does not show the deals section without a record', () => {
    expect(render()).not.toContain('الصفقات المرتبطة')
  })
})
