import '../config/registerBuiltinSections'
import { cn } from '../../../shared/utils/cn'
import { getMyWorkSections } from '../registry/myWorkRegistry'

/** Renders every registered section for the focus, in a responsive two-column grid. */
export function MyWorkBoard({ focus, enabledModules }) {
  const sections = getMyWorkSections({ focus, enabledModules })

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sections.map(({ id, component: Section, size }) => (
        <div key={id} className={cn('min-w-0', size === 'wide' && 'lg:col-span-2')}>
          <Section />
        </div>
      ))}
    </div>
  )
}
