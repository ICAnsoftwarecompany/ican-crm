import { useTranslation } from 'react-i18next'
import { Customer360Intro } from './components/Customer360Intro'
import { Customer360Navigation } from './components/Customer360Navigation'
import { Customer360Workspace } from './components/Customer360Workspace'

export function Customer360Page({ customerId, initialTab }) {
  const { i18n } = useTranslation()
  const direction = i18n.resolvedLanguage?.startsWith('en') ? 'ltr' : 'rtl'

  return (
    <main dir={direction} className="mx-auto w-full max-w-[1920px] min-w-0 space-y-2 pb-5">
      <Customer360Navigation customerId={customerId} />
      <Customer360Intro customerId={customerId} />
      <Customer360Workspace customerId={customerId} initialTab={initialTab} />
    </main>
  )
}
