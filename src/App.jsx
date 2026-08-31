import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryProvider } from './app/providers/QueryProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { router } from './app/router'
import { TenantNotificationsRealtime } from './realtime'
import './i18n'

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TenantNotificationsRealtime />
        <RouterProvider router={router} />
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
