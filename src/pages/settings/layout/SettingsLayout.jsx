import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { SettingsSidebar } from './SettingsSidebar'
import { SettingsMobileSidebar } from './SettingsMobileSidebar'
import { useLocalStorage } from '../../../shared/components/data-table/hooks/useLocalStorage'

export function SettingsLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [settingsSidebarCollapsed, setSettingsSidebarCollapsed] = useLocalStorage(
    'settings-sidebar-collapsed',
    false
  )

  return (
    <div className="flex min-h-0 flex-1 overflow-visible rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <SettingsSidebar
        collapsed={settingsSidebarCollapsed}
        onToggleCollapse={() => setSettingsSidebarCollapsed((value) => !value)}
      />
      <SettingsMobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 bg-[var(--brand-bg)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
            aria-expanded={mobileSidebarOpen}
            aria-controls="settings-mobile-sidebar"
          >
            <PanelLeft size={16} />
            قائمة الإعدادات
          </button>
        </div>

        <div className="min-w-0 p-4 lg:p-5">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
