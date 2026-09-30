import { useLocalStorage } from '../../../shared/components/data-table/hooks/useLocalStorage'
import { MY_WORK_FOCUS, MY_WORK_FOCUS_LIST, MY_WORK_FOCUS_STORAGE_KEY } from '../constants/myWorkFocus'

/** The viewer's chosen focus (all / sales / service), remembered in this browser. */
export function useMyWorkFocus() {
  const [stored, setStored] = useLocalStorage(MY_WORK_FOCUS_STORAGE_KEY, MY_WORK_FOCUS.all)
  const focus = MY_WORK_FOCUS_LIST.includes(stored) ? stored : MY_WORK_FOCUS.all
  return [focus, setStored]
}
