import { opportunitiesMockData } from '../mock/opportunitiesMockData'

// Every function here resolves a Promise with the exact same shape a real
// axios call through httpClient would return ({ data: ... }). When the
// backend is ready, only the function bodies below change to
// httpClient.get/post calls — nothing in hooks/ or components/ needs to move.

function cloneOpportunities() {
  return JSON.parse(JSON.stringify(opportunitiesMockData))
}

function simulateRequest(result, delayMs = 150) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), delayMs)
  })
}

export const opportunitiesApi = {
  getOpportunities: async (params) => {
    let rows = cloneOpportunities()

    if (params?.status) {
      rows = rows.filter((row) => row.status === params.status)
    }
    if (params?.type) {
      rows = rows.filter((row) => row.type === params.type)
    }

    return simulateRequest({ data: rows })
  },

  getOpportunityInfo: async (id) => {
    const found = cloneOpportunities().find((row) => row.id === id) || null
    return simulateRequest({ data: found })
  },

  qualifyOpportunity: async (id) => {
    return simulateRequest({ data: { id, status: 'qualified' } })
  },

  activateOpportunity: async (id, payload) => {
    return simulateRequest({
      data: {
        id,
        status: 'activated',
        estimated_value: payload?.estimated_value,
        assigned_user: payload?.assigned_user || null,
        assigned_team: payload?.assigned_team || null,
        next_action: payload?.next_action || null,
      },
    })
  },

  watchOpportunity: async (id, payload) => {
    return simulateRequest({
      data: {
        id,
        status: 'watching',
        watch_until: payload?.watch_until || null,
        watch_reason: payload?.reason || null,
      },
    })
  },

  dismissOpportunity: async (id, payload) => {
    return simulateRequest({
      data: {
        id,
        status: 'dismissed',
        dismiss_reason: payload?.reason || null,
        dismiss_note: payload?.note || null,
      },
    })
  },

  assignOpportunity: async (id, payload) => {
    return simulateRequest({
      data: {
        id,
        assigned_user: payload?.assigned_user || null,
        assigned_team: payload?.assigned_team || null,
      },
    })
  },
}
