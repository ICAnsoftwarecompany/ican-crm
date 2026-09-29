import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, Languages, LogOut, Mail, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../store/authStore'
import { Avatar } from '../ui/Avatar'

export function HeaderProfileMenu() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  if (!user) return null

  const name = user.name || user.login || user.username || user.email || t('app.profile.account')
  const secondary = user.email || user.username || user.login || ''
  const languageLabel = i18n.resolvedLanguage?.startsWith('ar') ? 'English' : 'العربية'

  const toggleLanguage = () => {
    const nextLanguage = i18n.resolvedLanguage?.startsWith('ar') ? 'en' : 'ar'
    i18n.changeLanguage(nextLanguage)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 text-[var(--text)] transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
          aria-label={t('app.profile.openMenu')}
          title={t('app.profile.openMenu')}
        >
          <Avatar name={name} src={user.avatar || user.image} size="sm" />
          <ChevronDown size={13} className="text-[var(--text-muted)]" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[1000] w-72 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--text)] shadow-2xl"
        >
          <div className="flex items-center gap-3 px-2 py-2.5">
            <Avatar name={name} src={user.avatar || user.image} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text)]">{name}</p>
              {secondary && <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{secondary}</p>}
            </div>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />

          <div className="space-y-1 px-2 py-1.5 text-xs text-[var(--text-muted)]">
            {user.username && <ProfileDetail icon={UserRound} label={t('app.profile.username')} value={user.username} />}
            {user.email && <ProfileDetail icon={Mail} label={t('app.profile.email')} value={user.email} />}
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />

          <ProfileMenuItem icon={Languages} onSelect={toggleLanguage}>
            <span>{t('common.language')}</span>
            <span className="ms-auto font-latin text-xs text-[var(--text-muted)]">{languageLabel}</span>
          </ProfileMenuItem>
          <ProfileMenuItem icon={LogOut} onSelect={handleLogout} danger>
            {t('actions.logout')}
          </ProfileMenuItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function ProfileDetail({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon size={13} className="shrink-0" />
      <span className="shrink-0">{label}:</span>
      <span className="truncate text-[var(--text)]" dir="auto">{value}</span>
    </div>
  )
}

function ProfileMenuItem({ icon: Icon, children, onSelect, danger = false }) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-[var(--surface-2)] ${danger ? 'text-[var(--danger,#dc2626)]' : 'text-[var(--text)]'}`}
    >
      <Icon size={15} />
      {children}
    </DropdownMenu.Item>
  )
}
