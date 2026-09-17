import { create } from 'zustand'

// Holds which opportunity is currently open in the drawer so that any screen
// (Overview cards, Inbox rows, Table rows) can open the exact same drawer
// instance just by calling open(id).
export const useOpportunityDrawerStore = create((set) => ({
  openOpportunityId: null,

  open: (opportunityId) => set({ openOpportunityId: opportunityId }),
  close: () => set({ openOpportunityId: null }),
}))
