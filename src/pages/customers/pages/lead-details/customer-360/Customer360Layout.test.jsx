import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { Customer360Layout } from './components/Customer360Layout'

const render = (props = {}, language = 'ar') => {
  const i18n = createInstance()
  i18n.init({ lng: language, fallbackLng: 'ar', initImmediate: false, resources: { ar: { translation: {} }, en: { translation: {} } } })
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <Customer360Layout
    header={<span>Customer header</span>}
    actions={<button type="button">Customer action</button>}
    overview={<span>Customer profile</span>}
    tabs={<nav>Customer tabs</nav>}
    content={<article>Customer activity</article>}
    floatingChats={<div>Customer chats</div>}
    {...props}
      />
    </I18nextProvider>
  )
}

describe('Customer360Layout', () => {
  it('renders every core section and inherits the application direction', () => {
    const html = render()
    expect(html).toContain('dir="rtl"')
    for (const value of ['Customer header', 'Customer action', 'Customer profile', 'Customer tabs', 'Customer activity', 'Customer chats']) {
      expect(html).toContain(value)
    }
  })

  it('switches to LTR for English', () => {
    expect(render({}, 'en')).toContain('dir="ltr"')
  })

  it('places profile, activity and actions side by side in reading order', () => {
    const html = render({ deals: <span>Deal record</span> })
    expect(html).toContain('lg:grid-cols-12')
    expect(html.indexOf('Customer header')).toBeLessThan(html.indexOf('Customer activity'))
    expect(html.indexOf('Customer activity')).toBeLessThan(html.indexOf('Customer action'))
    expect(html.indexOf('Deal record')).toBeLessThan(html.indexOf('Customer activity'))
  })

  it('shows related deals when supplied', () => {
    expect(render({ deals: <span>Deal record</span> })).toContain('Deal record')
  })

  it('does not show the deals section without a record', () => {
    expect(render()).not.toContain('الصفقات المرتبطة')
  })
})
