import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryProvider } from './app/providers/QueryProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { router } from './app/router'
import { TenantNotificationsRealtime } from './realtime'
import { SessionRefreshModal } from './features/auth/components/SessionRefreshModal'
import './i18n'

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TenantNotificationsRealtime />
        <RouterProvider router={router} />
        <SessionRefreshModal />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            classNames: {
              toast: 'font-arabic',
            },
          }}
        />
      </ThemeProvider>
    </QueryProvider>
  )
}
