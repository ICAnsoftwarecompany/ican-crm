import { createDefaultManualPlacements } from '../config/metaPlacements'
import { getCallToActions } from '../config/metaCallToActions'

export const WIZARD_STATE_VERSION = 2

export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function createDefaultSchedule() {
  return { startType: 'now', startTime: '', endType: 'never', endTime: '' }
}

export const DEFAULT_COUNTRY_LOCATION = Object.freeze({
  key: 'EG',
  type: 'country',
  countryCode: 'EG',
  name: { en: 'Egypt', ar: 'مصر' },
  mode: 'include',
})

export function createDefaultLeadFormDraft() {
  return {
    name: '',
    formType: 'higher_intent',
    locale: 'ar_AR',
    intro: { headline: '', description: '' },
    questions: [
      { id: createId('q'), type: 'FULL_NAME' },
      { id: createId('q'), type: 'PHONE' },
    ],
    customQuestions: [],
    privacyPolicyUrl: '',
    privacyLinkText: '',
    thankYou: { headline: '', description: '', buttonType: 'VIEW_WEBSITE', buttonText: '', website: '', phone: '' },
  }
}

export function createDefaultAd({ conversionLocation = '', index = 0 } = {}) {
  return {
    id: createId('ad'),
    name: '',
    nameIndex: index + 1,
    format: 'single_image',
    identity: { pageId: '', instagramAccountId: '' },
    media: null,
    carouselCards: [],
    existingPostId: '',
    primaryTexts: [''],
    headlines: [''],
    description: '',
    callToAction: getCallToActions(conversionLocation)[0],
    websiteUrl: '',
    displayLink: '',
    urlParameters: '',
    leadForm: { mode: 'existing', formId: '', draft: createDefaultLeadFormDraft() },
    messageTemplate: { greeting: '', iceBreakers: [''] },
    phoneNumber: '',
  }
}

export function createDefaultAdSet({ conversionLocation = '', performanceGoal = '', index = 0 } = {}) {
  return {
    id: createId('adset'),
    name: '',
    nameIndex: index + 1,
    conversionLocation,
    performanceGoal,
    pixelId: '',
    customEventType: '',
    whatsappPhoneNumber: '',
    instagramAccountId: '',
    applicationId: '',
    objectStoreUrl: '',
    eventId: '',
    frequencyMax: 2,
    frequencyIntervalDays: 7,
    budgetType: 'daily',
    budgetAmount: '',
    bidStrategy: 'highest_volume',
    bidAmount: '',
    roasFloor: '',
    useCampaignSchedule: true,
    schedule: createDefaultSchedule(),
    dayparting: { enabled: false, days: [0, 1, 2, 3, 4, 5, 6], startHour: 9, endHour: 22 },
    audience: {
      advantageAudience: true,
      geo: { locationType: 'home_or_recent', locations: [{ ...DEFAULT_COUNTRY_LOCATION }] },
      ageMin: 18,
      ageMax: 65,
      genders: 'all',
      languages: [],
      detailedTargeting: [],
      detailedExclusions: [],
      customAudienceIds: [],
      excludedCustomAudienceIds: [],
    },
    placements: {
      mode: 'advantage',
      manual: createDefaultManualPlacements(conversionLocation),
      devices: ['mobile', 'desktop'],
    },
    ads: [createDefaultAd({ conversionLocation })],
  }
}

export function createInitialPublishState() {
  return { status: 'idle', campaignRemoteId: null, adSetRemoteIds: {}, adRemoteIds: {}, leadFormRemoteIds: {}, pendingAdIds: [], currentStepId: null, failedStepId: null, lastError: null, finishedAt: null }
}

export function createInitialWizardState({ draftId } = {}) {
  const firstAdSet = createDefaultAdSet()
  const now = new Date().toISOString()
  return {
    version: WIZARD_STATE_VERSION,
    draftId: draftId || createId('draft'),
    presetId: '',
    objective: '',
    campaign: {
      name: '',
      pageId: '',
      specialAdCategories: [],
      specialAdCategoryCountries: [],
      budgetLevel: 'campaign',
      budgetType: 'daily',
      budgetAmount: '',
      bidStrategy: 'highest_volume',
      bidAmount: '',
      roasFloor: '',
      spendCap: '',
      schedule: createDefaultSchedule(),
      publishStatus: 'PAUSED',
    },
    adSets: [firstAdSet],
    leadRouting: { teamId: '', tagIds: [], statusId: '', note: '' },
    meta: {
      currentStage: 'objective',
      focusedField: null,
      activeAdSetId: firstAdSet.id,
      activeAdIdByAdSet: { [firstAdSet.id]: firstAdSet.ads[0].id },
      createdAt: now,
      lastSavedAt: null,
      dirty: false,
      touched: {},
      showAllErrors: false,
      visitedStages: ['objective'],
    },
    publish: createInitialPublishState(),
  }
}
