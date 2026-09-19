export default {
  "pageTitle": "Outreach Campaigns",
  "pageDescription": "Send WhatsApp, Gmail and Messenger campaigns to your leads and customers from one place.",
  "createCampaign": "Create Campaign",
  "emptyTable": "No outreach campaigns yet.",
  "channels": {
    "whatsapp": {
      "label": "WhatsApp",
      "description": "Send approved WhatsApp templates to your audience."
    },
    "gmail": {
      "label": "Gmail",
      "description": "Send email campaigns using a connected mailbox."
    },
    "messenger": {
      "label": "Messenger",
      "description": "Reach customers through your connected Messenger channel."
    },
    "unknown": "Unknown channel"
  },
  "status": {
    "draft": "Draft",
    "scheduled": "Scheduled",
    "running": "Running",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "failed": "Failed",
    "unknown": "Unknown"
  },
  "objectives": {
    "retargeting": "Retargeting",
    "followUp": "Follow-up",
    "promotion": "Promotion",
    "reactivation": "Reactivation",
    "upsell": "Upsell",
    "crossSell": "Cross-sell",
    "qualification": "Qualification",
    "announcement": "Announcement",
    "custom": "Custom"
  },
  "stats": {
    "total": "Total Campaigns",
    "scheduled": "Scheduled",
    "running": "Running",
    "completed": "Completed",
    "cancelled": "Cancelled"
  },
  "table": {
    "campaign": "Campaign",
    "channel": "Channel",
    "audience": "Audience",
    "status": "Status",
    "startDate": "Start Date",
    "createdBy": "Created By",
    "assignedUsers": "Assigned Users",
    "noAssignees": "No assignees",
    "progress": "Progress",
    "engagement": "Engagement",
    "lastUpdated": "Last Updated",
    "actions": "Actions"
  },
  "metrics": {
    "notAvailable": "Tracking not available yet"
  },
  "actions": {
    "view": "View",
    "edit": "Edit",
    "cancel": "Cancel",
    "delete": "Delete",
    "cancelSuccess": "Campaign cancelled",
    "deleteSuccess": "Campaign deleted",
    "actionError": "Couldn't complete the action",
    "confirmDeleteTitle": "Delete this campaign?",
    "confirmDeleteMessage": "This permanently deletes the campaign. This cannot be undone.",
    "confirmCancelTitle": "Cancel this campaign?",
    "confirmCancelMessage": "This stops scheduled/active sending according to backend behavior."
  },
  "wizard": {
    "steps": {
      "setup": "Setup",
      "audience": "Audience",
      "channel": "Channel",
      "content": "Content",
      "schedule": "Schedule",
      "team": "Team",
      "review": "Review"
    },
    "createTitle": "Create Campaign",
    "editTitle": "Edit Campaign",
    "createSuccess": "Campaign created",
    "updateSuccess": "Campaign updated",
    "submitError": "Couldn't save the campaign",
    "fixErrors": "Please fix the highlighted fields before continuing",
    "launch": "Launch Campaign",
    "saveChanges": "Save Changes"
  },
  "setup": {
    "name": "Campaign Name",
    "objective": "Purpose",
    "objectivePlaceholder": "Select a purpose (optional)",
    "objectiveNote": "For your own organization only — not sent to the backend yet."
  },
  "audience": {
    "matchCount": "{{count}} customers in this audience",
    "addSelected": "Add selected ({{count}}) to audience",
    "inAudience": "In Audience",
    "added": "Added",
    "currentAudience": "Current audience",
    "addCustomers": "Add Customers",
    "noCustomers": "No customers in this audience yet.",
    "addSuccess": "{{count}} customers added",
    "removeSuccess": "Customer removed from campaign",
    "missingPhone": "missing a WhatsApp/phone number",
    "missingEmail": "missing an email address",
    "eligibilityUnknown": "eligibility unknown"
  },
  "channelStep": {
    "connected": "Connected",
    "notConnected": "Integration not connected",
    "setup": "Set up"
  },
  "content": {
    "preview": "Preview",
    "pickChannelFirst": "Pick a channel first",
    "whatsapp": {
      "phoneNumber": "Phone Number",
      "selectPhone": "Select a connected WhatsApp number",
      "template": "Template",
      "selectTemplate": "Select a template",
      "headerParams": "Header variables",
      "bodyParams": "Body variables"
    },
    "gmail": {
      "mailbox": "From Mailbox",
      "selectMailbox": "Select a connected mailbox",
      "subject": "Subject",
      "body": "Email Body"
    },
    "messenger": {
      "page": "Messenger Page",
      "selectPage": "Select a connected Messenger page",
      "externalIdNote": "Backend clarification required: this maps to the campaign's external_id field. Confirm with backend before relying on it.",
      "manualId": "Or enter external ID manually",
      "body": "Message"
    },
    "noContent": "This campaign has no content yet."
  },
  "schedule": {
    "sendNow": "Send Now",
    "date": "Date",
    "time": "Time",
    "timezoneNote": "Times are shown in your local timezone ({{timezone}})."
  },
  "team": {
    "search": "Search users",
    "note": "These users are responsible for this campaign and its follow-up."
  },
  "review": {
    "name": "Name",
    "objective": "Purpose",
    "audience": "Audience",
    "schedule": "Schedule",
    "team": "Team",
    "attachments": "Attachments",
    "channel": "Channel",
    "eligibleSample": "Eligible customers (sample)",
    "warnings": {
      "notConnected": "{{channel}} integration is not connected.",
      "ineligible": "{{count}} customers are {{field}}.",
      "eligibilityUnknown": "{{count}} customers have unknown eligibility for this channel.",
      "noAssignees": "No assigned users.",
      "incompleteVariables": "Some template variables are incomplete."
    }
  },
  "attachments": {
    "title": "Attachments",
    "upload": "Upload",
    "empty": "No attachments yet.",
    "remove": "Remove"
  },
  "details": {
    "back": "Back to campaigns",
    "notFound": "Campaign not found",
    "channel": "Channel",
    "startDate": "Start Date",
    "createdBy": "Created By",
    "createdAt": "Created At",
    "updatedAt": "Updated At",
    "assignedUsers": "Assigned Users",
    "tabs": {
      "overview": "Overview",
      "audience": "Audience",
      "content": "Content",
      "activity": "Activity",
      "performance": "Performance",
      "automation": "Sequence / Automation"
    }
  },
  "activity": {
    "notAvailableTitle": "No activity tracking yet",
    "notAvailableDescription": "The backend doesn't expose campaign lifecycle events yet — this will show a delivery/reply timeline once it does."
  },
  "performance": {
    "notAvailableTitle": "No analytics available",
    "notAvailableDescription": "The backend doesn't expose delivery/engagement analytics for this channel yet.",
    "metrics": {
      "sent": "Sent",
      "delivered": "Delivered",
      "read": "Read",
      "opened": "Opened",
      "clicked": "Clicked",
      "replied": "Replied"
    }
  },
  "preview": {
    "emptyMessage": "Your message will appear here",
    "from": "From",
    "subject": "Subject"
  },
  "validation": {
    "nameRequired": "Campaign name is required",
    "channelRequired": "Select a channel",
    "audienceRequired": "Add at least one customer to the audience",
    "scheduleDateRequired": "Select a date",
    "scheduleTimeRequired": "Select a time",
    "phoneNumberRequired": "Select a WhatsApp phone number",
    "templateRequired": "Select a template",
    "mailboxRequired": "Select a mailbox",
    "subjectRequired": "Subject is required",
    "messageRequired": "Message is required",
    "externalIdRequired": "Enter a Messenger external ID"
  }
}
