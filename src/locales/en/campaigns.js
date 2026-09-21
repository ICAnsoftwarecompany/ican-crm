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
    "steps": { "objective": "Objective", "campaignSetup": "Campaign Setup", "adSets": "Ad Sets", "ads": "Ads", "review": "Review" },
    "objectiveStep": {
      "intro": "Choose the outcome that matters most for this campaign. You can't change it once the campaign is created.",
      "useWhen": {
        "OUTCOME_AWARENESS": "You want as many people as possible to see the ad, and don't have enough conversion data yet",
        "OUTCOME_TRAFFIC": "You want visits to your website or page, or you're still collecting Pixel data",
        "OUTCOME_ENGAGEMENT": "You want likes, comments, shares, or Messenger conversations",
        "OUTCOME_LEADS": "You want to collect contact details (name, email, phone) directly",
        "OUTCOME_APP_PROMOTION": "You want app installs or in-app events",
        "OUTCOME_SALES": "You want purchases — requires a working Pixel or Conversions API"
      },
      "lockedNote": "You can't change the objective after the campaign is created — duplicate the campaign with a new objective instead."
    },
    "campaignSetup": {
      "specialAdCategory": {
        "label": "Special ad category",
        "options": { "NONE": "None", "CREDIT": "Credit", "EMPLOYMENT": "Employment", "HOUSING": "Housing" }
      },
      "budgetLevel": {
        "label": "How do you want to control the budget?",
        "campaign": { "title": "One budget for the whole campaign", "description": "Recommended — Meta automatically shifts spend to whichever ad set performs best." },
        "adSet": { "title": "Separate budget per ad set", "description": "Full control — each ad set gets its fixed amount regardless of performance." },
        "adSetNote": "You'll set each ad set's budget in the next stage."
      },
      "budget": {
        "type": { "label": "Budget type", "daily": "Daily", "lifetime": "Lifetime" },
        "amount": "Budget amount",
        "startType": { "label": "Start", "now": "Start now", "scheduled": "Start at a scheduled time" },
        "startTime": "Start time",
        "endType": { "label": "End", "never": "Never", "scheduled": "End at a scheduled time" },
        "endTime": "End time",
        "bidStrategy": { "label": "Bid strategy", "highest_volume": "Highest volume", "cost_cap": "Cost cap", "bid_cap": "Bid cap" },
        "bidAmount": "Bid amount"
      }
    },
    "guide": {
      "title": "Guide",
      "empty": "Hover or focus a field to see guidance here.",
      "objective": {
        "default": { "title": "Pick what result matters most", "body": "Your objective decides which optimization goals and destinations are available in later stages." },
        "OUTCOME_AWARENESS": { "title": "Awareness", "body": "Choose this when you want as many people as possible to see the ad and you don't have enough conversion data yet." },
        "OUTCOME_TRAFFIC": { "title": "Traffic", "body": "Choose this when you want visits to your website or page, or you're still building up Pixel data." },
        "OUTCOME_ENGAGEMENT": { "title": "Engagement", "body": "Choose this for likes, comments, shares, or Messenger conversations." },
        "OUTCOME_LEADS": { "title": "Leads", "body": "Choose this when you want to collect contact details directly — the most relevant objective for CRM-driven campaigns." },
        "OUTCOME_APP_PROMOTION": { "title": "App promotion", "body": "Choose this when you want app installs or in-app events." },
        "OUTCOME_SALES": { "title": "Sales", "body": "Choose this when you want purchases — a working Pixel or Conversions API is required." }
      },
      "campaignSetup": {
        "default": { "title": "Set up the basics", "body": "Name your campaign and decide who controls the budget: the campaign as a whole, or each ad set individually." },
        "name": { "title": "Campaign name", "body": "Used internally to identify this campaign — customers never see it." },
        "pageId": { "title": "Facebook Page", "body": "The Page your ads will be published from." },
        "specialAdCategories": { "title": "Special ad category", "body": "Credit, employment and housing ads have legally required targeting restrictions in many places — selecting one here locks certain targeting fields in a later stage." },
        "budgetLevel": { "title": "Campaign vs. ad set budget", "body": "Use campaign budget if you have more than one audience and want the algorithm to pick the best one. Use a separate budget per ad set if you want every audience to get an equal chance — useful for a fair A/B test." },
        "budget": {
          "type": { "title": "Budget type", "body": "Daily spends up to this amount every day. Lifetime spends this total across the whole schedule." },
          "amount": { "title": "Budget amount", "body": "The amount Meta can spend, in your ad account's currency." },
          "schedule": { "title": "Schedule", "body": "Start now or pick a future start time, and optionally set an end date." },
          "bidStrategy": { "title": "Bid strategy", "body": "Highest volume lets Meta spend your full budget for the most results. Cost cap and bid cap give you more control over your average or maximum cost per result." }
        }
      }
    },
    "draft": {
      "savedAt": "Saved {{time}}",
      "resumePrompt": "You have a saved draft from {{time}}. Resume it?",
      "resume": "Resume draft",
      "startFresh": "Start fresh"
    },
    "review": {
      "intro": "Review the campaign details below before creating it.",
      "note": "Ad set, ad and lead-form details you set up are saved to this draft, but aren't connected to a provider API yet — this campaign will be created with just the details below."
    }
  },
  "objectives": {
    "OUTCOME_AWARENESS": "Awareness",
    "OUTCOME_TRAFFIC": "Traffic",
    "OUTCOME_ENGAGEMENT": "Engagement",
    "OUTCOME_LEADS": "Leads",
    "OUTCOME_APP_PROMOTION": "App Promotion",
    "OUTCOME_SALES": "Sales"
  },
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
