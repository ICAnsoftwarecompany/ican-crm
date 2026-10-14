import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import i18n from '../i18n'
import { syncDocumentLanguage } from '../shared/utils/documentLanguage'
import { usePortalPreferences } from '../features/portal'
import { portalRouter } from './router'
import { PortalBranding } from './PortalBranding'

/**
 * Customer portal app (separate entry: portal.html → own bundle). Shares only `shared/`, `locales/` and
 * `services/` with the CRM — no staff auth store, no staff router, no realtime.
 */
export default function PortalApp() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false } } }))
  const isDark = usePortalPreferences((state) => state.isDark)

  useEffect(() => {
    syncDocumentLanguage(i18n.resolvedLanguage || i18n.language)
    i18n.on('languageChanged', syncDocumentLanguage)
    return () => i18n.off('languageChanged', syncDocumentLanguage)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <QueryClientProvider client={queryClient}>
      <PortalBranding />
      <RouterProvider router={portalRouter} />
      <Toaster position="top-center" richColors toastOptions={{ classNames: { toast: 'font-arabic' } }} />
    </QueryClientProvider>
  )
}
