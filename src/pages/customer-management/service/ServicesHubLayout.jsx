import { Outlet } from 'react-router-dom'
import { ServicesHubNav } from '../../features/service'

/** Shell for the Services hub: records, batches, assets, contracts, handoffs share one sidebar item. */
export function ServicesHubLayout() {
  return (
    <div className="grid gap-4 p-4 lg:p-5">
      <ServicesHubNav />
      <Outlet />
    </div>
  )
}

export default ServicesHubLayout
