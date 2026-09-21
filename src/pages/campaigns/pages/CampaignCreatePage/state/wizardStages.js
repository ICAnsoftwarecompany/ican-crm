// The wizard's 5 top-level stages. Renamed from the old flat
// ['campaign','adSet','audience','creative','review'] to match the
// redesigned flow: Objective and Campaign Setup are now separate stages,
// and Ad Set / Audience / Placements are one merged "Ad Sets" stage (they
// are properties of the same Ad Set object, not independent steps).
//
// `adSets` and `ads` still render NotConfiguredStep until Phase 2/3 replace
// them — see src/features/campaigns/docs/CAMPAIGN_CENTER_ARCHITECTURE_AR.md.
export const STAGES = ['objective', 'campaignSetup', 'adSets', 'ads', 'review']
