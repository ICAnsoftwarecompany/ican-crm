import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import { ResourceState } from '../shared/components/data/ResourceState'
import {
  GuestTrack,
  LoginScreen,
  PortalAssets,
  PortalCaseDetail,
  PortalCases,
  PortalCatalog,
  PortalCompanyUsers,
  PortalDocuments,
  PortalHelp,
  PortalHome,
  PortalLayout,
  PortalNewCase,
  PortalPayments,
  PortalRecordDetail,
  PortalRecords,
  useMe,
  usePortalSession,
} from '../features/portal'

/** Everything behind sign-in. `/me` is re-read on load so a revoked session goes back to sign-in. */
function RequireSession() {
  const token = usePortalSession((state) => state.token)
  const me = useMe({ enabled: Boolean(token) })
  if (!token) return <Navigate to="/login" replace />
  if (me.isLoading && !usePortalSession.getState().me) return <div className="p-6"><ResourceState isLoading /></div>
  return <Outlet />
}

/** Portal routes. Base path `/portal` in dev and the default deploy; a portal subdomain can serve it at `/` too. */
export const PORTAL_BASENAME = import.meta.env.VITE_PORTAL_BASENAME ?? '/portal'

export const portalRouter = createBrowserRouter(
  [
    { path: '/login', element: <LoginScreen /> },
    { path: '/track', element: <GuestTrack /> },
    {
      element: <RequireSession />,
      children: [
        {
          element: <PortalLayout />,
          children: [
            { index: true, element: <PortalHome /> },
            { path: 'services', element: <PortalRecords /> },
            { path: 'services/:recordId', element: <PortalRecordDetail /> },
            { path: 'requests', element: <PortalCases /> },
            { path: 'requests/new', element: <PortalNewCase /> },
            { path: 'requests/:caseId', element: <PortalCaseDetail /> },
            { path: 'catalog', element: <PortalCatalog /> },
            { path: 'payments', element: <PortalPayments /> },
            { path: 'assets', element: <PortalAssets /> },
            { path: 'documents', element: <PortalDocuments /> },
            { path: 'help', element: <PortalHelp /> },
            { path: 'company', element: <PortalCompanyUsers /> },
            { path: '*', element: <Navigate to="/" replace /> },
          ],
        },
      ],
    },
  ],
  { basename: PORTAL_BASENAME }
)
