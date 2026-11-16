import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function LeadDetailsBreadcrumbs() {
  const { t } = useTranslation()
  return (
    <nav className="text-sm text-[var(--text-muted)]" aria-label={t('customers.leadDetails.breadcrumb')}>
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/LeadsCenter" className="font-semibold text-[#007A80] hover:underline">
            {t('customers.leadDetails.customers')}
          </Link>
        </li>
        <li>/</li>
        <li className="font-semibold text-[var(--text)]">{t('customers.leadDetails.title')}</li>
      </ol>
    </nav>
  )
}
