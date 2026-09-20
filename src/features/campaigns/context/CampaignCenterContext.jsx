import { createContext, useContext } from 'react'

const CampaignCenterContext = createContext(null)

export function CampaignCenterProvider({ value, children }) {
  return <CampaignCenterContext.Provider value={value}>{children}</CampaignCenterContext.Provider>
}

export function useCampaignCenter() {
  const value = useContext(CampaignCenterContext)
  if (!value) throw new Error('useCampaignCenter must be used inside CampaignCenterProvider')
  return value
}
