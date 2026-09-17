import { Facebook, Link2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../../../../shared/components/ui/Button'
import { Badge } from '../../../../../shared/components/ui/Badge'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { useAuthStore } from '../../../../../store/authStore'
import { resolveTenantId } from '../../../../../services/tenantResolver'
import { facebookMetaApi } from '../../../../../features/meta-integrations/api/facebookMetaApi'
import { extractMetaConnectLink, resolveMetaConnectUrl } from '../../../../../features/meta-integrations/utils/metaConnectUrl'
import { extractList, displayValue, extractMessage } from '../../../../../shared/utils/apiResponse'

export function MetaIntegrationTab() {
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)
  const queryClient = useQueryClient()

  const pagesQuery = useQuery({
    queryKey: ['meta-integrations', 'facebook-pages', tenant],
    queryFn: () => facebookMetaApi.getPages(tenant),
    enabled: Boolean(tenant),
    select: (data) => extractList(data, ['pages']),
  })

  const connectFacebook = useMutation({
    mutationFn: () => facebookMetaApi.connect(tenant, {}),
  })

  const refreshFacebookToken = useMutation({
    mutationFn: () => facebookMetaApi.refreshToken(tenant, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meta-integrations', 'facebook-pages', tenant] }),
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
              <h2 className="font-bold text-[var(--text)]">ربط حساب ميتا (Meta)</h2>
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

      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
        <h3 className="font-bold mb-3">صفحات فيسبوك المرتبطة</h3>
        <ResourceState
          isLoading={pagesQuery.isLoading}
          error={pagesQuery.error}
          empty={(pagesQuery.data || []).length === 0}
          emptyTitle="لا توجد صفحات مرتبطة بعد"
          emptyDescription="بعد إتمام الربط مع ميتا ستظهر صفحات فيسبوك الخاصة بالحساب هنا."
          onRetry={pagesQuery.refetch}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {(pagesQuery.data || []).map((page, index) => (
              <article key={page.id || index} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3">
                <h4 className="font-bold text-sm">{displayValue(page.name)}</h4>
                <p className="text-xs text-[var(--text-muted)]">{displayValue(page.category)}</p>
                <Badge variant={page.active === false ? 'danger' : 'success'}>
                  {page.active === false ? 'غير نشطة' : 'نشطة'}
                </Badge>
              </article>
            ))}
          </div>
        </ResourceState>
      </section>
    </div>
  )
}
