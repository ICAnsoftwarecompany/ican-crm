export default {
  "description": "Manage CRM campaigns, ads, and linked forms.",
  "nameRequired": "Campaign name is required",
  "saveSuccess": "Campaign saved",
  "saveError": "Failed to save campaign",
  "newCampaign": "New Campaign",
  "nameLabel": "Campaign Name",
  "descriptionLabel": "Description",
  "statusLabel": "Status",
  "statusActive": "Active",
  "statusInactive": "Inactive",
  "saveCampaign": "Save Campaign",
  "noCampaigns": "No campaigns yet",
  "activeAds": "Active Ads",
  "adsCount": "{{count}} ads",
  "adForms": "Ad Forms",
  "formsCount": "{{count}} forms",
  "platforms": { "meta": "Meta Ads", "google": "Google Ads", "tiktok": "TikTok Ads", "snapchat": "Snapchat Ads" },
  "connection": { "connected": "Connected", "disconnected": "Disconnected", "expired": "Expired", "needsAttention": "Needs attention" },
  "center": {
    "title": "Campaign Center", "sidebarDescription": "Platforms, campaigns, analytics and billing", "platforms": "Platforms", "platformNavigation": "Campaign platform navigation", "openNavigation": "Open campaign navigation", "closeNavigation": "Close campaign navigation", "integrationSettings": "Campaign integration settings", "account": "Ad account", "sync": "Sync",
    "nav": { "overview": "Overview", "create": "Create campaign", "list": "Campaigns", "analytics": "Analytics", "billing": "Billing & Wallet" }
  },
  "states": {
    "disconnected": { "title": "Platform not connected", "description": "Connect this advertising platform from Integrations before loading campaign data.", "action": "Open integrations" },
    "permission": { "title": "Permission required", "description": "You do not have permission to access this campaign capability." },
    "package": { "title": "Platform unavailable", "description": "This advertising platform is not included in the current package." },
    "unavailable": { "title": "Provider not configured", "description": "The platform workspace is ready, but its provider API has not been connected yet." },
    "notConfigured": { "title": "Not configured", "description": "No API contract is available for this section yet. No placeholder metrics are displayed." },
    "noAccount": { "title": "No ad account", "description": "Connect or select an advertising account before creating a campaign." }
  },
  "overview": { "title": "Platform overview", "description": "Account status and recent campaign activity.", "recentCampaigns": "Recent campaigns" },
  "list": { "title": "Campaigns", "description": "Search, filter, sort and inspect campaigns returned by the selected platform account." },
  "metrics": { "totalCampaigns": "Total campaigns", "activeCampaigns": "Active campaigns", "spend": "Spend", "results": "Results", "notAvailable": "Not available" },
  "columns": { "campaign": "Campaign", "page": "Page", "platform": "Platform", "status": "Status", "objective": "Objective", "budget": "Budget", "spend": "Spend", "impressions": "Impressions", "reach": "Reach", "ctr": "CTR", "results": "Results", "startDate": "Start date", "endDate": "End date", "lastSync": "Last sync" },
  "create": {
    "title": "Create campaign", "description": "Create a campaign using the selected platform account.", "name": "Campaign name", "page": "Facebook page", "selectPage": "Select page", "objective": "Objective", "submit": "Create campaign", "required": "Campaign name and page are required", "success": "Campaign created successfully", "error": "Failed to create campaign",
    "saveDraft": "Save Draft", "continue": "Continue",
    "steps": { "campaign": "Campaign", "adSet": "Ad Set", "audience": "Audience", "creative": "Creative", "review": "Review" },
    "review": {
      "intro": "Review the campaign details below before creating it.",
      "note": "Ad set, audience and creative setup aren't connected to a provider API yet, so this campaign will be created with just the details below."
    }
  },
  "objectives": { "OUTCOME_LEADS": "Leads", "OUTCOME_TRAFFIC": "Traffic" },
  "analytics": { "title": "Campaign analytics", "description": "Performance and CRM attribution workspace for the selected account." },
  "billing": { "title": "Billing & Wallet", "description": "Billing accounts, balances, transactions and invoices supported by the platform." },
  "details": {
    "title": "Campaign {{id}}", "description": "Campaign resources returned by the connected provider.",
    "adSets": "Ad Sets", "noAdSets": "No ad sets were returned for this campaign.",
    "basics": "Campaign Overview", "selectAdSet": "Select an ad set below to view its performance and creative data.",
    "selectCampaign": "Select a campaign",
    "performance": "Ad / Creative Performance", "noInsights": "No performance data available for this ad set yet.",
    "actionsBreakdown": "Actions Breakdown", "costPerAction": "Cost per Action", "videoPerformance": "Video Performance",
    "reportingPeriod": "Reporting period",
    "stages": { "all": "All Details", "campaign": "Campaign", "adset": "Ad Set", "ad": "Ad" }
  },
  "adSet": {
    "status": "Status", "effectiveStatus": "Effective Status", "optimizationGoal": "Optimization Goal",
    "billingEvent": "Billing Event", "budgetRemaining": "Budget Remaining", "targeting": "Targeting",
    "ageRange": "{{min}}–{{max}}", "countries": "Countries", "createdOn": "Created on"
  },
  "insights": {
    "frequency": "Frequency", "cpm": "CPM", "cpc": "CPC", "costPerUniqueClick": "Cost per Unique Click",
    "clicks": "Clicks", "uniqueClicks": "Unique Clicks", "uniqueCtr": "Unique CTR",
    "inlineLinkClicks": "Link Clicks (Inline)", "inlineLinkClickCtr": "Link CTR (Inline)", "postEngagement": "Post Engagement"
  },
  "video": {
    "plays": "Video Plays", "avgWatchTime": "Avg. Watch Time (sec)", "watched25": "Watched 25%", "watched50": "Watched 50%",
    "watched75": "Watched 75%", "watched95": "Watched 95%", "watched100": "Watched 100%", "watched30Sec": "Watched 30 Seconds"
  },
  "actionTypes": {
    "linkClick": "Link Clicks", "postReaction": "Post Reactions", "landingPageView": "Landing Page Views",
    "omniLandingPageView": "Landing Page Views (Omni)", "postEngagement": "Post Engagement", "like": "Likes",
    "postInteractionGross": "Post Interactions (Gross)", "pageEngagement": "Page Engagement",
    "postInteractionNet": "Post Interactions (Net)", "comment": "Comments", "post": "Posts", "photoView": "Photo Views",
    "videoView": "Video Views", "lead": "Leads", "onsiteWebLead": "On-site Web Leads",
    "offsiteCompleteRegistration": "Completed Registrations", "offsiteSearch": "Off-site Searches",
    "offsiteContentView": "Off-site Content Views", "offsiteSubmitApplication": "Submitted Applications",
    "offsiteContactWebsite": "Website Contacts", "conversionLead": "Leads (Conversion)",
    "conversionLeadGrouped": "Leads (Total)", "postSave": "Post Saves", "postNetSave": "Post Saves (Net)",
    "postNetLike": "Likes (Net)", "postNetComment": "Comments (Net)", "postUnlike": "Unlikes",
    "totalMessagingConnection": "Messaging Connections", "messagingConversationStarted": "Conversations Started",
    "messagingConversationReplied": "Conversations Replied", "messagingFirstReply": "First Replies",
    "messagingWelcomeMessageView": "Welcome Message Views", "messagingDepth2": "Messages (Depth 2)",
    "messagingDepth3": "Messages (Depth 3)", "messagingDepth5": "Messages (Depth 5)"
  }
}
