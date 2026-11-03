import { Customer360Intro } from './components/Customer360Intro'
import { Customer360Navigation } from './components/Customer360Navigation'
import { Customer360Workspace } from './components/Customer360Workspace'

export function Customer360Page({ customerId, initialTab }) {
  return <main dir="rtl" className="mx-auto w-full max-w-[1720px] space-y-4 pb-8"><Customer360Navigation customerId={customerId} /><Customer360Intro customerId={customerId} /><Customer360Workspace customerId={customerId} initialTab={initialTab} /></main>
}
