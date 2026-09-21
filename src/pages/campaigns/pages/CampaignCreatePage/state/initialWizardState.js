function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createDefaultSchedule() {
  return { startType: 'now', startTime: '', endType: 'never', endTime: '' }
}

// Full shape for one Ad Set, including the fields only used once Phase 2/3
// build the Ad Sets/Ads stages — kept complete now so autosaved drafts don't
// need a migration once those stages start writing to them.
function createDefaultAdSet() {
  const id = createId('adset')
  return {
    id,
    name: '',
    budgetType: 'daily',
    budgetAmount: '',
    schedule: createDefaultSchedule(),
    bidStrategy: 'highest_volume',
    bidAmount: '',
    conversionLocation: '',
    performanceGoal: '',
    audience: {
      mode: 'advantage',
      countries: ['EG'],
      languages: [],
      ageMin: 18,
      ageMax: 65,
      genders: 'all',
      exclusions: [],
      detailedTargeting: [],
      customAudienceIds: [],
      lookalikeAudienceIds: [],
    },
    placements: { mode: 'advantage', manualSelections: [] },
    ads: [],
  }
}

export function createInitialWizardState() {
  const firstAdSet = createDefaultAdSet()

  return {
    objective: 'OUTCOME_LEADS',
    campaign: {
      name: '',
      // Temporary for Phase 1: belongs on each Ad (features/campaigns'
      // Phase 3 AdEditor) once the Ads stage exists — Publish Now needs a
      // page_id today and there is nowhere else to collect one yet.
      pageId: '',
      specialAdCategories: [],
      budgetLevel: 'campaign', // 'campaign' | 'adSet'
      budgetType: 'daily',
      budgetAmount: '',
      schedule: createDefaultSchedule(),
      bidStrategy: 'highest_volume',
      bidAmount: '',
    },
    adSets: [firstAdSet],
    meta: {
      lastSavedAt: null,
      currentStage: 'objective',
      focusedField: null,
      isDraft: true,
      activeAdSetId: firstAdSet.id,
      activeAdIdByAdSet: {},
    },
  }
}
