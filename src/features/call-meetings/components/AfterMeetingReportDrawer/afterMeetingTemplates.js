import { Building2, Handshake, Home, Presentation, Users } from 'lucide-react'

function withAdditionalNotes(fields, additionalNotesField) {
  if (fields.some((field) => field.key === additionalNotesField.key)) return fields
  return [...fields, additionalNotesField]
}

export function getAfterMeetingTemplates(t) {
  const additionalNotesField = {
    key: 'additional_notes',
    label: t('activities.afterMeetingReport.additionalNotesLabel'),
    type: 'textarea',
  }

  const f = (template, key) => `activities.afterMeetingReport.templates.${template}.fields.${key}`
  const label = (template, key) => t(`${f(template, key)}.label`)
  const opts = (template, key, count) => Array.from({ length: count }, (_, index) => t(`${f(template, key)}.options.${index}`))
  const interestLevelOptions = () => [
    t('activities.afterMeetingReport.options.interestLevel.veryHigh'),
    t('activities.afterMeetingReport.options.interestLevel.high'),
    t('activities.afterMeetingReport.options.interestLevel.medium'),
    t('activities.afterMeetingReport.options.interestLevel.low'),
    t('activities.afterMeetingReport.options.interestLevel.notInterested'),
  ]
  const propertyTypeOptions = () => [
    t('activities.preMeetingReport.options.apartment'),
    t('activities.preMeetingReport.options.villa'),
    t('activities.preMeetingReport.options.townhouse'),
    t('activities.preMeetingReport.options.duplex'),
    t('activities.preMeetingReport.options.chalet'),
    t('activities.preMeetingReport.options.officeAdmin'),
    t('activities.preMeetingReport.options.commercialShop'),
    t('activities.preMeetingReport.options.land'),
    t('activities.preMeetingReport.options.unspecified'),
  ]
  const paymentPreferenceOptions = () => [
    t('activities.preMeetingReport.options.cash'),
    t('activities.preMeetingReport.options.installment'),
    t('activities.preMeetingReport.options.cashOrInstallment'),
    t('activities.preMeetingReport.options.unspecified'),
  ]

  return [
    {
      id: 'real-estate-discovery-result',
      title: t('activities.afterMeetingReport.templates.realEstateDiscoveryResult.title'),
      description: t('activities.afterMeetingReport.templates.realEstateDiscoveryResult.description'),
      category: 'real_estate',
      icon: Home,
      fields: withAdditionalNotes([
        { key: 'meeting_summary', label: label('realEstateDiscoveryResult', 'meetingSummary'), type: 'textarea', required: true },
        { key: 'confirmed_property_type', label: label('realEstateDiscoveryResult', 'confirmedPropertyType'), type: 'select', required: true, options: propertyTypeOptions() },
        { key: 'confirmed_location', label: label('realEstateDiscoveryResult', 'confirmedLocation'), type: 'textarea' },
        { key: 'confirmed_budget', label: label('realEstateDiscoveryResult', 'confirmedBudget'), type: 'text' },
        { key: 'payment_preference', label: label('realEstateDiscoveryResult', 'paymentPreference'), type: 'select', options: paymentPreferenceOptions() },
        { key: 'customer_interest_level', label: label('realEstateDiscoveryResult', 'customerInterestLevel'), type: 'select', required: true, options: interestLevelOptions() },
        { key: 'customer_objections', label: label('realEstateDiscoveryResult', 'customerObjections'), type: 'textarea' },
        { key: 'decision_maker', label: label('realEstateDiscoveryResult', 'decisionMaker'), type: 'text' },
        { key: 'information_needed', label: label('realEstateDiscoveryResult', 'informationNeeded'), type: 'textarea' },
        { key: 'next_step', label: label('realEstateDiscoveryResult', 'nextStep'), type: 'textarea', required: true },
      ], additionalNotesField),
    },
    {
      id: 'property-presentation-result',
      title: t('activities.afterMeetingReport.templates.propertyPresentationResult.title'),
      description: t('activities.afterMeetingReport.templates.propertyPresentationResult.description'),
      category: 'real_estate',
      icon: Building2,
      fields: withAdditionalNotes([
        { key: 'meeting_summary', label: label('propertyPresentationResult', 'meetingSummary'), type: 'textarea', required: true },
        { key: 'properties_presented', label: label('propertyPresentationResult', 'propertiesPresented'), type: 'textarea', required: true },
        { key: 'preferred_property', label: label('propertyPresentationResult', 'preferredProperty'), type: 'text' },
        { key: 'customer_feedback', label: label('propertyPresentationResult', 'customerFeedback'), type: 'textarea', required: true },
        { key: 'preferred_features', label: label('propertyPresentationResult', 'preferredFeatures'), type: 'textarea' },
        { key: 'rejected_features', label: label('propertyPresentationResult', 'rejectedFeatures'), type: 'textarea' },
        { key: 'price_feedback', label: label('propertyPresentationResult', 'priceFeedback'), type: 'textarea' },
        { key: 'payment_feedback', label: label('propertyPresentationResult', 'paymentFeedback'), type: 'textarea' },
        { key: 'customer_objections', label: label('propertyPresentationResult', 'customerObjections'), type: 'textarea' },
        { key: 'follow_up_requirement', label: label('propertyPresentationResult', 'followUpRequirement'), type: 'textarea' },
        { key: 'next_step', label: label('propertyPresentationResult', 'nextStep'), type: 'select', required: true, options: opts('propertyPresentationResult', 'nextStep', 7) },
      ], additionalNotesField),
    },
    {
      id: 'real-estate-negotiation-result',
      title: t('activities.afterMeetingReport.templates.realEstateNegotiationResult.title'),
      description: t('activities.afterMeetingReport.templates.realEstateNegotiationResult.description'),
      category: 'real_estate',
      icon: Handshake,
      fields: withAdditionalNotes([
        { key: 'meeting_summary', label: label('realEstateNegotiationResult', 'meetingSummary'), type: 'textarea', required: true },
        { key: 'property', label: label('realEstateNegotiationResult', 'property'), type: 'text', required: true },
        { key: 'initial_price', label: label('realEstateNegotiationResult', 'initialPrice'), type: 'text' },
        { key: 'negotiated_price', label: label('realEstateNegotiationResult', 'negotiatedPrice'), type: 'text' },
        { key: 'agreed_down_payment', label: label('realEstateNegotiationResult', 'agreedDownPayment'), type: 'text' },
        { key: 'agreed_installment_period', label: label('realEstateNegotiationResult', 'agreedInstallmentPeriod'), type: 'text' },
        { key: 'customer_objections', label: label('realEstateNegotiationResult', 'customerObjections'), type: 'textarea' },
        { key: 'concessions_offered', label: label('realEstateNegotiationResult', 'concessionsOffered'), type: 'textarea' },
        { key: 'deal_status', label: label('realEstateNegotiationResult', 'dealStatus'), type: 'select', required: true, options: opts('realEstateNegotiationResult', 'dealStatus', 8) },
        { key: 'expected_close_date', label: label('realEstateNegotiationResult', 'expectedCloseDate'), type: 'date' },
        { key: 'next_step', label: label('realEstateNegotiationResult', 'nextStep'), type: 'textarea', required: true },
      ], additionalNotesField),
    },
    {
      id: 'general-sales-result',
      title: t('activities.afterMeetingReport.templates.generalSalesResult.title'),
      description: t('activities.afterMeetingReport.templates.generalSalesResult.description'),
      category: 'general',
      icon: Users,
      fields: withAdditionalNotes([
        { key: 'meeting_summary', label: label('generalSalesResult', 'meetingSummary'), type: 'textarea', required: true },
        { key: 'customer_needs', label: label('generalSalesResult', 'customerNeeds'), type: 'textarea' },
        { key: 'customer_feedback', label: label('generalSalesResult', 'customerFeedback'), type: 'textarea' },
        { key: 'interested_products', label: label('generalSalesResult', 'interestedProducts'), type: 'textarea' },
        { key: 'customer_objections', label: label('generalSalesResult', 'customerObjections'), type: 'textarea' },
        { key: 'budget_discussed', label: label('generalSalesResult', 'budgetDiscussed'), type: 'text' },
        { key: 'decision_maker', label: label('generalSalesResult', 'decisionMaker'), type: 'text' },
        { key: 'decision_timeline', label: label('generalSalesResult', 'decisionTimeline'), type: 'text' },
        { key: 'deal_probability', label: label('generalSalesResult', 'dealProbability'), type: 'select', options: opts('generalSalesResult', 'dealProbability', 5) },
        { key: 'next_step', label: label('generalSalesResult', 'nextStep'), type: 'select', required: true, options: opts('generalSalesResult', 'nextStep', 9) },
        { key: 'follow_up_date', label: label('generalSalesResult', 'followUpDate'), type: 'date' },
      ], additionalNotesField),
    },
    {
      id: 'demo-presentation-result',
      title: t('activities.afterMeetingReport.templates.demoPresentationResult.title'),
      description: t('activities.afterMeetingReport.templates.demoPresentationResult.description'),
      category: 'general',
      icon: Presentation,
      fields: withAdditionalNotes([
        { key: 'meeting_summary', label: label('demoPresentationResult', 'meetingSummary'), type: 'textarea', required: true },
        { key: 'features_presented', label: label('demoPresentationResult', 'featuresPresented'), type: 'textarea' },
        { key: 'customer_liked', label: label('demoPresentationResult', 'customerLiked'), type: 'textarea' },
        { key: 'customer_concerns', label: label('demoPresentationResult', 'customerConcerns'), type: 'textarea' },
        { key: 'questions_asked', label: label('demoPresentationResult', 'questionsAsked'), type: 'textarea' },
        { key: 'missing_requirements', label: label('demoPresentationResult', 'missingRequirements'), type: 'textarea' },
        { key: 'customer_interest_level', label: label('demoPresentationResult', 'customerInterestLevel'), type: 'select', required: true, options: interestLevelOptions() },
        { key: 'proposal_requested', label: label('demoPresentationResult', 'proposalRequested'), type: 'select', options: opts('demoPresentationResult', 'proposalRequested', 3) },
        { key: 'trial_requested', label: label('demoPresentationResult', 'trialRequested'), type: 'select', options: opts('demoPresentationResult', 'trialRequested', 3) },
        { key: 'next_step', label: label('demoPresentationResult', 'nextStep'), type: 'select', required: true, options: opts('demoPresentationResult', 'nextStep', 9) },
        { key: 'follow_up_date', label: label('demoPresentationResult', 'followUpDate'), type: 'date' },
      ], additionalNotesField),
    },
  ]
}

export function getAfterMeetingTemplateById(id, t) {
  return getAfterMeetingTemplates(t).find((template) => template.id === id)
}

export function getAfterMeetingCategoryLabel(category, t) {
  return category === 'real_estate' ? t('activities.afterMeetingReport.categoryRealEstate') : t('activities.afterMeetingReport.categoryGeneral')
}
