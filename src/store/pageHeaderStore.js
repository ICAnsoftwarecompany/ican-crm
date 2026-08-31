import { create } from 'zustand'

/**
 * Holds whatever the *current page* wants to show in the shared Header:
 * - title / icon        -> shown on the left (e.g. "Rockets" + rocket icon)
 * - actions             -> a ReactNode with page-specific buttons
 *                          (e.g. "Fly again / Schedule launch / Retire" on the
 *                          Rockets page, something else on the Leads page)
 *
 * Pages set this via the usePageHeader() hook, so Header.jsx itself stays
 * generic and doesn't need to know about every page's buttons.
 */
export const usePageHeaderStore = create((set) => ({
  title: '',
  icon: null,
  actions: null,
  setPageHeader: ({ title, icon, actions }) =>
    set({ title, icon, actions: actions ?? null }),
  resetPageHeader: () => set({ title: '', icon: null, actions: null }),
}))
