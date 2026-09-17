import { Facebook, Instagram, Link2, MessageCircle, Megaphone, Phone, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../../../../shared/components/ui/Button'
import { Badge } from '../../../../../shared/components/ui/Badge'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { useAuthStore } from '../../../../../store/authStore'
import { resolveTenantId } from '../../../../../services/tenantResolver'
import { facebookMetaApi } from '../../../../../features/meta-integrations/api/facebookMetaApi'
import { useFacebookIntegrations } from '../../../../../features/meta-integrations/hooks/useFacebookIntegrations'
import { extractMetaConnectLink, resolveMetaConnectUrl } from '../../../../../features/meta-integrations/utils/metaConnectUrl'
import { displayValue, extractMessage } from '../../../../../shared/utils/apiResponse'

function IntegrationCard({ icon, title, count, children, emptyDescription }) {
  return (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
          {icon}
        </div>
        <h3 className="font-bold">{title}</h3>
        {typeof count === 'number' && <Badge variant="info">{count}</Badge>}
      </div>
      {children.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{emptyDescription}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{children}</div>
      )}
    </section>
  )
}

export function MetaIntegrationTab() {
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)
  const queryClient = useQueryClient()

  const integrationsQuery = useFacebookIntegrations(tenant)
  const integrations = integrationsQuery.data || {}
  const facebookPages = integrations.facebook_pages || []
  const messengerPages = integrations.messenger || []
  const instagramAccounts = integrations.instagram || []
  const whatsappAccounts = integrations.whatsapp || []
  const adAccounts = integrations.ad_accounts || []
  const counts = integrations.counts || {}
  const isConnected = Boolean(integrations.is_connected)

  const connectFacebook = useMutation({
    mutationFn: () => facebookMetaApi.connect(tenant, {}),
  })

  const refreshFacebookToken = useMutation({
    mutationFn: () => facebookMetaApi.refreshToken(tenant, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meta-integrations', 'facebook-integrations', tenant] }),
  })

  const handleConnect = async () => {
    if (!tenant) {
      toast.error('تعذر تحديد بيانات الحساب (Tenant) لبدء الربط مع ميتا')
      return
    }

    try {
      const response = await connectFacebook.mutateAsync()
      const link = extractMetaConnectLink(response)
      const redirectUrl = resolveMetaConnectUrl(link)

      if (!redirectUrl) {
        toast.error('تعذر الحصول على رابط الربط مع ميتا')
        return
      }

      window.location.href = redirectUrl
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر بدء الربط مع ميتا'))
    }
  }

  const handleRefreshToken = async () => {
    if (!tenant) return

    try {
      await refreshFacebookToken.mutateAsync()
      toast.success('تم تحديث بيانات الاتصال مع ميتا')
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تحديث بيانات الاتصال مع ميتا'))
    }
  }

  return (
    <div className="grid gap-4">
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F0FE] text-[#1877F2]">
              <Facebook size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-[var(--text)]">ربط حساب ميتا (Meta)</h2>
                {!integrationsQuery.isLoading && (
                  <Badge variant={isConnected ? 'success' : 'danger'}>
                    {isConnected ? 'الحساب مربوط ونشط' : 'غير مرتبط'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                اربط حساب فيسبوك الخاص بالشركة للحصول على صفحات فيسبوك وواتساب وماسنجر داخل النظام.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefreshToken} loading={refreshFacebookToken.isPending} disabled={!tenant}>
              <RefreshCw size={16} />
              تحديث الاتصال
            </Button>
            <Button onClick={handleConnect} loading={connectFacebook.isPending} disabled={!tenant}>
              <Link2 size={16} />
              ربط حساب ميتا
            </Button>
          </div>
        </div>
      </section>

      <ResourceState
        isLoading={integrationsQuery.isLoading}
        error={integrationsQuery.error}
        empty={!isConnected && facebookPages.length === 0 && whatsappAccounts.length === 0}
        emptyTitle="لا توجد صفحات مرتبطة بعد"
        emptyDescription="بعد إتمام الربط مع ميتا ستظهر صفحات فيسبوك وواتساب وماسنجر الخاصة بالحساب هنا."
        onRetry={integrationsQuery.refetch}
      >
        <div className="grid gap-4">
          <IntegrationCard
            icon={<Facebook size={16} />}
            title="صفحات فيسبوك المرتبطة"
            count={counts.facebook_pages}
            emptyDescription="لا توجد صفحات فيسبوك مرتبطة بعد."
          >
            {facebookPages.map((page) => (
              <article key={page.id} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3">
                <h4 className="font-bold text-sm">{displayValue(page.name)}</h4>
                <p className="text-xs text-[var(--text-muted)]">Page ID: {displayValue(page.page_id)}</p>
                <Badge variant={page.is_active ? 'success' : 'danger'}>
                  {page.is_active ? 'نشطة' : 'غير نشطة'}
                </Badge>
              </article>
            ))}
          </IntegrationCard>

          <IntegrationCard
            icon={<MessageCircle size={16} />}
            title="ماسنجر"
            count={counts.messenger}
            emptyDescription="لا توجد حسابات ماسنجر مرتبطة بعد."
          >
            {messengerPages.map((page) => (
              <article key={page.id} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3">
                <h4 className="font-bold text-sm">{displayValue(page.name)}</h4>
                <p className="text-xs text-[var(--text-muted)]">Page ID: {displayValue(page.page_id)}</p>
                <Badge variant={page.is_active ? 'success' : 'danger'}>
                  {page.is_active ? 'نشط' : 'غير نشط'}
                </Badge>
              </article>
            ))}
          </IntegrationCard>

          <IntegrationCard
            icon={<Instagram size={16} />}
            title="انستجرام"
            count={counts.instagram}
            emptyDescription="لا توجد حسابات انستجرام مرتبطة بعد."
          >
            {instagramAccounts.map((account) => (
              <article key={account.id} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3">
                <h4 className="font-bold text-sm">{displayValue(account.page_name)}</h4>
                <p className="text-xs text-[var(--text-muted)]">Account ID: {displayValue(account.instagram_account_id)}</p>
                <Badge variant={account.is_active ? 'success' : 'danger'}>
                  {account.is_active ? 'نشط' : 'غير نشط'}
                </Badge>
              </article>
            ))}
          </IntegrationCard>

          <IntegrationCard
            icon={<Phone size={16} />}
            title="واتساب"
            count={counts.whatsapp}
            emptyDescription="لا توجد أرقام واتساب مرتبطة بعد."
          >
            {whatsappAccounts.map((account) => (
              <article key={account.id} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3">
                <h4 className="font-bold text-sm">{displayValue(account.verified_name)}</h4>
                <p className="text-xs text-[var(--text-muted)]">{displayValue(account.display_phone_number)}</p>
                <Badge variant={account.quality_rating === 'GREEN' ? 'success' : 'warning'}>
                  {displayValue(account.quality_rating)}
                </Badge>
              </article>
            ))}
          </IntegrationCard>

          <IntegrationCard
            icon={<Megaphone size={16} />}
            title="الحسابات الإعلانية"
            count={counts.ad_accounts}
            emptyDescription="لا توجد حسابات إعلانية مرتبطة بعد."
          >
            {adAccounts.map((account) => (
              <article key={account.id} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3">
                <h4 className="font-bold text-sm">{displayValue(account.id)}</h4>
                <p className="text-xs text-[var(--text-muted)]">Account ID: {displayValue(account.account_id)}</p>
              </article>
            ))}
          </IntegrationCard>
        </div>
      </ResourceState>
    </div>
  )
}
