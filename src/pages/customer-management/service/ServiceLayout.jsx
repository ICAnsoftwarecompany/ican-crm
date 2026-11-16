import { Outlet } from 'react-router-dom'

/**
 * Shell for every /service/* route. Service-wide chrome (internal sidebar,
 * breadcrumbs) is added here in F1 when real sections ship.
 */
export function ServiceLayout() {
  return (
    <div className="min-w-0 flex-1">
      <Outlet />
    </div>
  )
}

export default ServiceLayout
