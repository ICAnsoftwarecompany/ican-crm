import { useTranslation } from 'react-i18next'
import { Customer360Activity } from './Customer360Activity'
import { Customer360Profile } from './Customer360Profile'
import { Customer360Actions } from './Customer360Actions'
import { Customer360Deals } from './Customer360Deals'

/**
 * Customer 360 command center: localized profile / activity / actions.
 * Slots retain the existing CRM queries, mutations, permissions and dialogs.
 * On smaller screens the columns stack without hiding any functionality.
 */
export function Customer360Layout({ header, actions, overview, tabs, content, deals, floatingChats }) {
  const { t, i18n } = useTranslation()
  const direction = i18n.resolvedLanguage?.startsWith('en') ? 'ltr' : 'rtl'

  return (
    <div dir={direction} className="min-w-0" data-testid="customer-360-layout">
      <div className="grid min-w-0 grid-cols-1 items-start gap-3 lg:grid-cols-12 xl:gap-4">
        <aside aria-label={t('customers.leadDetails.profileAndDeals')} className="min-w-0 space-y-3 lg:col-span-3 lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:overscroll-contain">
          <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {header}
          </div>
          <Customer360Deals>{deals}</Customer360Deals>
          <Customer360Profile>{overview}</Customer360Profile>
        </aside>

        <main aria-label={t('customers.leadDetails.activityAndHistory')} className="min-w-0 lg:col-span-6">
          <Customer360Activity tabs={tabs} content={content} />
        </main>

        <aside aria-label={t('customers.leadDetails.actionsAndCommunication')} className="min-w-0 lg:col-span-3 lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:overscroll-contain">
          <Customer360Actions>{actions}</Customer360Actions>
        </aside>
      </div>
      {floatingChats}
    </div>
  )
}
