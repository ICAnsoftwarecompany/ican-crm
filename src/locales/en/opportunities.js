export default {
  "title": "Opportunity Center",
  "description": "Discover potential cross-sell, upsell and renewal opportunities and track them in one place.",
  "overview": "Overview",
  "inbox": "Opportunity Inbox",
  "table": "All Opportunities",
  "noOpportunities": "No opportunities yet",
  "potentialRevenue": "Total Potential Revenue",
  "highPotential": "High Potential",
  "needsAttention": "Needs Attention",
  "sourceDistribution": "Source Distribution",
  "topOpportunities": "Top Opportunities",
  "why": "Why This Opportunity?",
  "signals": "Signals",
  "noSignals": "No signals recorded for this opportunity.",
  "activityTimeline": "Activity Timeline",
  "noActivity": "No activity recorded yet.",
  "scoreBreakdown": "Score Breakdown",
  "aiConfidence": "AI Confidence",
  "aiConfidenceHint": "How confident the AI is in this opportunity's source — entirely separate from the opportunity's own Score.",
  "aiConfidenceUnavailable": "No AI Confidence because this opportunity's source is not an AI suggestion.",
  "dismiss": "Dismiss",
  "watch": "Watch",
  "qualify": "Qualify",
  "activate": "Activate",
  "assign": "Assign",
  "scoreOutOf100": "Score / 100",
  "estimatedValue": "Potential Value",
  "unassigned": "Unassigned",
  "types": {
    "new_sale": "New Sale",
    "cross_sell": "Cross-sell",
    "upsell": "Upsell",
    "expansion": "Expansion",
    "renewal": "Renewal",
    "reactivation": "Reactivation",
    "buying_intent": "Buying Intent",
    "campaign_engagement": "Campaign Engagement",
    "referral": "Referral",
    "other": "Other"
  },
  "statuses": {
    "new": "New",
    "reviewing": "Reviewing",
    "watching": "Watching",
    "qualified": "Qualified",
    "activated": "Activated",
    "dismissed": "Dismissed",
    "expired": "Expired"
  },
  "sources": {
    "ai": "AI",
    "system_rule": "System Rule",
    "segment": "Segment",
    "campaign": "Campaign",
    "conversation": "Conversation",
    "customer_service": "Customer Service",
    "manual": "Manual",
    "other": "Other"
  },
  "signalTypes": {
    "ai_conversation": "AI Conversation",
    "segment_match": "Segment Match",
    "campaign_event": "Campaign Event",
    "manual_note": "Manual Note",
    "call_report": "Call Report",
    "meeting_report": "Meeting Report"
  },
  "dismissReasons": {
    "not_relevant": "Not Relevant",
    "wrong_recommendation": "Wrong Recommendation",
    "already_purchased": "Already Purchased",
    "no_need": "No Need",
    "bad_timing": "Bad Timing",
    "no_budget": "No Budget",
    "duplicate": "Duplicate Opportunity",
    "customer_not_eligible": "Customer Not Eligible",
    "wrong_product": "Wrong Product",
    "other": "Other Reason"
  },
  "timelineEvents": {
    "detected": "Opportunity detected",
    "signal_added": "New signal added",
    "score_changed": "Opportunity score changed",
    "assigned": "Opportunity assigned",
    "status_changed": "Opportunity status changed",
    "note_added": "Note added"
  },
  "scoreComponents": {
    "fit": "Fit",
    "intent": "Intent",
    "engagement": "Engagement",
    "timing": "Timing"
  },
  "relativeTime": {
    "now": "Now",
    "minutesAgo": "{{count}} minutes ago",
    "hoursAgo": "{{count}} hours ago",
    "daysAgo": "{{count}} days ago",
    "monthsAgo": "{{count}} months ago"
  },
  "timelineMeta": {
    "statusChanged": "New status: {{status}}",
    "scoreChanged": "From {{from}} to {{to}}",
    "assignedTo": "Assigned to {{name}}"
  },
  "columns": {
    "title": "Opportunity",
    "customer": "Customer",
    "type": "Type",
    "product": "Product",
    "priority": "Priority",
    "source": "Source",
    "owner": "Owner",
    "status": "Status",
    "nextAction": "Next Action",
    "detectedAt": "Detected On"
  },
  "dialogs": {
    "optionalPlaceholder": "Optional",
    "dismiss": {
      "title": "Dismiss Opportunity",
      "reasonLabel": "Dismissal Reason",
      "noteLabel": "Note",
      "submit": "Dismiss Opportunity",
      "reasonRequired": "Choose a dismissal reason first",
      "successMsg": "Opportunity dismissed",
      "errorMsg": "Could not dismiss the opportunity"
    },
    "activate": {
      "title": "Activate Opportunity",
      "submit": "Activate",
      "successMsg": "Opportunity activated successfully",
      "errorMsg": "Could not activate the opportunity",
      "productLabel": "Product",
      "estimatedValueLabel": "Estimated Value",
      "assignToLabel": "Assign To",
      "teamLabel": "Team",
      "nextActionLabel": "Next Action",
      "nextActionAtLabel": "Next Action Date",
      "nextActionOptions": {
        "call_customer": "Call the customer",
        "send_proposal": "Send a proposal",
        "schedule_meeting": "Schedule a meeting",
        "send_email": "Send a follow-up email"
      }
    },
    "watch": {
      "title": "Watch Opportunity",
      "submit": "Watch",
      "successMsg": "Opportunity is now being watched",
      "errorMsg": "Could not watch the opportunity",
      "reviewDateLabel": "Review again on",
      "reasonLabel": "Reason"
    },
    "assign": {
      "title": "Assign Opportunity",
      "submit": "Assign",
      "successMsg": "Opportunity assigned",
      "errorMsg": "Could not assign the opportunity",
      "userLabel": "Assigned User",
      "teamLabel": "Team"
    }
  },
  "groups": {
    "high_potential": "High Potential",
    "needs_review": "Needs Review",
    "needs_attention": "Needs Urgent Follow-up",
    "ai_suggested": "AI Suggested",
    "system_detected": "System Detected",
    "campaign_generated": "From a Campaign",
    "watching": "Watching"
  },
  "inbox": {
    "emptyGroup": "No opportunities in this group right now",
    "empty": "Opportunity inbox is empty"
  },
  "actionsBar": {
    "qualifySuccess": "Opportunity qualified",
    "qualifyError": "Could not qualify the opportunity"
  },
  "customerCard": {
    "title": "Customer Details",
    "openProfile": "Open Customer Profile",
    "nameLabel": "Name",
    "industryLabel": "Industry",
    "employeesLabel": "Employee Count",
    "currentProductsLabel": "Current Products",
    "none": "None"
  },
  "drawer": {
    "title": "Opportunity Details",
    "notFound": "Could not find this opportunity's data."
  },
  "you": "You"
}
