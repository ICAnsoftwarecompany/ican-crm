import { Customer360Panel } from './Customer360Panel'
import { Customer360Activity } from './Customer360Activity'
import { Customer360Profile } from './Customer360Profile'
import { Customer360Actions } from './Customer360Actions'
import { Customer360Deals } from './Customer360Deals'

/** Presentation-only slots; CustomerDetailsContent owns queries, mutations and dialogs. */
export function Customer360Layout({ header, actions, overview, tabs, content, deals, floatingChats }) {
  return (
    <div dir="rtl" className="min-w-0 space-y-4" data-testid="customer-360-layout">
      <Customer360Panel>{header}</Customer360Panel>
      <Customer360Actions>{actions}</Customer360Actions>
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <div className="min-w-0 space-y-4 xl:col-span-8">
          <Customer360Activity tabs={tabs} content={content} />
          <Customer360Deals>{deals}</Customer360Deals>
        </div>
        <aside className="min-w-0 xl:col-span-4">
          <Customer360Profile>{overview}</Customer360Profile>
        </aside>
      </div>
      {floatingChats}
    </div>
  )
}
