import { CheckCircle2, SlidersHorizontal, Tags } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { useLocalStorage } from '../../../../shared/components/data-table/hooks/useLocalStorage'
import { CustomerStatusesTab } from './CustomerStatusesTab'
import { CustomerTagsTab } from './CustomerTagsTab'

const TABS = [
  {
    id: 'statuses',
    label: 'حالات العملاء',
    description: 'إعداد مراحل وتصنيفات حالة العميل.',
    icon: CheckCircle2,
    component: CustomerStatusesTab,
  },
  {
    id: 'tags',
    label: 'تاج العملاء',
    description: 'إدارة الوسوم التي تظهر على العملاء.',
    icon: Tags,
    component: CustomerTagsTab,
  },
]

export function CustomerCustomizationPage() {
  const [activeTab, setActiveTab] = useLocalStorage('customers-customization-active-tab', TABS[0].id)
  const activeTabConfig = TABS.find((tab) => tab.id === activeTab) || TABS[0]
  const ActiveTabComponent = activeTabConfig.component

  return (
    <div className="space-y-5">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
            <SlidersHorizontal size={19} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[var(--text)]">الإعداد والتخصيص</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
              إدارة إعدادات العملاء في تبويبات منفصلة، مع حفظ آخر تبويب تم فتحه بعد تحديث الصفحة.
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] p-2" role="tablist" aria-label="تبويبات الإعداد والتخصيص">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTabConfig.id === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex min-w-40 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
                  isActive
                    ? 'bg-[#E8F9FA] font-bold text-[#007A80]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-bold text-[var(--text)]">{activeTabConfig.label}</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{activeTabConfig.description}</p>
        </div>

        <div className="p-4" role="tabpanel">
          <ActiveTabComponent />
        </div>
      </div>
    </div>
  )
}
