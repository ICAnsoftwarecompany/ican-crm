import { useEffect } from 'react'
import { usePageHeaderStore } from '../../store/pageHeaderStore'

/**
 * Usage inside any page, e.g. Rockets.jsx:
 *
 *   usePageHeader({
 *     title: 'Rockets',
 *     icon: Rocket,
 *     actions: (
 *       <>
 *         <HeaderButton icon={RotateCcw} label="Fly again" />
 *         <HeaderButton icon={CalendarPlus2} label="Schedule launch" />
 *         <HeaderButton icon={Power} label="Retire" />
 *       </>
 *     ),
 *   })
 */
export function usePageHeader({ title, icon, actions }) {
  const setPageHeader = usePageHeaderStore((s) => s.setPageHeader)
  const resetPageHeader = usePageHeaderStore((s) => s.resetPageHeader)

  useEffect(() => {
    setPageHeader({ title, icon, actions })
    return () => resetPageHeader()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, actions])
}
