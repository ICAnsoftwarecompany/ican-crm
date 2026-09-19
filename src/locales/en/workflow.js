export default {
  "localOnlyNotice": "No backend automation engine is connected yet — Save/Activate only stores this workflow locally on this device.",
  "metrics": {
    "notAvailable": "Not tracked yet"
  },
  "status": {
    "draft": "Draft",
    "active": "Active",
    "paused": "Paused",
    "archived": "Archived"
  },
  "operators": {
    "equals": "equals",
    "notEquals": "does not equal",
    "contains": "contains",
    "notContains": "does not contain",
    "greaterThan": "is greater than",
    "lessThan": "is less than",
    "isEmpty": "is empty",
    "isNotEmpty": "is not empty",
    "in": "is one of",
    "notIn": "is not one of"
  },
  "modules": {
    "leads": "Leads",
    "opportunities": "Opportunities",
    "outreachCampaigns": "Outreach Campaigns",
    "tasks": "Tasks",
    "notifications": "Notifications"
  },
  "dataSources": {
    "users": "Users",
    "teams": "Teams",
    "leadStatuses": "Lead Statuses",
    "tags": "Tags",
    "opportunityStatuses": "Opportunity Statuses",
    "outreachCampaigns": "Outreach Campaigns",
    "whatsappTemplates": "WhatsApp Templates",
    "outreachChannels": "Outreach Channels",
    "whatsappPhoneNumbers": "WhatsApp Phone Numbers",
    "messengerPages": "Messenger Pages",
    "gmailMailboxes": "Gmail Mailboxes"
  },
  "fields": {
    "selectPlaceholder": "Select...",
    "insertVariable": "Insert a variable",
    "previewLabel": "Preview",
    "noOptions": "No options available",
    "unsupportedType": "Unsupported field type: {{type}}"
  },
  "builder": {
    "namePlaceholder": "Workflow name",
    "selectModule": "Select a module",
    "saveDraft": "Save Draft",
    "draftSaved": "Draft saved locally",
    "activate": "Activate",
    "activated": "Workflow activated (local status only)",
    "pause": "Pause",
    "paused": "Workflow paused",
    "duplicate": "Duplicate",
    "duplicated": "Workflow duplicated",
    "saveBeforeDuplicate": "Save this workflow before duplicating it",
    "archive": "Archive",
    "archived": "Workflow archived",
    "nameRequiredToast": "Give the workflow a name before saving",
    "fixErrorsBeforeActivate": "Fix the errors below before activating",
    "validationErrorsTitle": "This workflow can't be activated yet",
    "confirmArchiveTitle": "Archive this workflow?",
    "confirmArchiveMessage": "Archived workflows are kept but no longer editable from the list. You can still duplicate them.",
    "confirmRemoveBranchTitle": "Remove this step?",
    "confirmRemoveBranchMessage": "This step's branches will be removed with it — anything configured inside them will be lost.",
    "nodeLibrary": "Node Library",
    "properties": "Properties",
    "libraryHint": "Add a step or pick a trigger to see options here.",
    "selectNodeHint": "Select a node to configure it.",
    "searchNodes": "Search...",
    "logicSection": "Logic",
    "recommendedActions": "Recommended",
    "thisModuleActions": "This module",
    "thisModuleTriggers": "This module",
    "backendNotConnected": "Not connected to a real backend yet",
    "backendNotConnectedShort": "No backend",
    "triggerLabel": "Trigger",
    "actionLabel": "Action",
    "conditionLabel": "Condition",
    "waitLabel": "Wait",
    "waitForEventLabel": "Wait for Event",
    "endLabel": "End",
    "endDescription": "Ends this branch of the workflow. Nothing runs after it.",
    "pickTriggerHint": "Click the trigger above to pick when this workflow should start.",
    "selectTrigger": "Select a trigger",
    "selectAction": "Select an action",
    "createAutomation": "Create Automation",
    "addStep": "Add step",
    "addRule": "Add rule",
    "quickAddCondition": "Add a known condition",
    "noConditionsYet": "No conditions configured yet",
    "noConfigNeeded": "This action needs no configuration.",
    "ruleLabel": "Rule {{index}}",
    "fieldLabel": "Field",
    "fieldPlaceholder": "e.g. lead.source",
    "operatorLabel": "Operator",
    "valueLabel": "Value",
    "groupOperatorLabel": "Combine rules with",
    "groupOperator": {
      "and": "AND",
      "or": "OR"
    },
    "branch": {
      "true": "Yes",
      "false": "No",
      "resolved": "Resolved",
      "timeout": "Timeout"
    },
    "waitModeLabel": "Wait type",
    "waitModeDuration": "For a duration",
    "waitModeUntil": "Until a date/time",
    "unitLabel": "Unit",
    "untilLabel": "Until",
    "units": {
      "minutes": "minutes",
      "hours": "hours",
      "days": "days"
    },
    "waitNotConfigured": "Not configured yet",
    "waitDurationSummary": "Wait {{value}} {{unit}}",
    "waitUntilSummary": "Wait until {{date}}",
    "eventLabel": "Event to wait for",
    "timeoutValueLabel": "Timeout after",
    "waitForEventNotConfigured": "Not configured yet",
    "waitForEventNoTimeout": "Wait for: {{event}}",
    "waitForEventWithTimeout": "Wait for: {{event}} (timeout {{value}} {{unit}})",
    "waitForEventNoSchedulerNote": "No backend scheduler exists yet to actually wait for this event — see WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md."
  },
  "validation": {
    "triggerRequired": "Pick a trigger before activating",
    "invalidTriggerReference": "This trigger is no longer registered",
    "invalidActionReference": "This action is no longer registered",
    "fieldRequired": "The \"{{field}}\" field is required",
    "conditionRulesRequired": "Add at least one condition rule",
    "branchesRequired": "Both branches must lead somewhere (even if just to End)",
    "waitDurationRequired": "Set a wait duration",
    "waitUntilRequired": "Set a wait-until date/time",
    "waitForEventRequired": "Pick an event to wait for",
    "waitForEventNoScheduler": "No backend scheduler exists to actually wait for this event yet",
    "emptyWorkflow": "This workflow has no steps after the trigger yet",
    "backendNotSupported": "This step's backend isn't connected yet — see docs"
  },
  "variables": {
    "leadName": "Lead Name",
    "leadPhone": "Lead Phone",
    "leadEmail": "Lead Email",
    "leadSource": "Lead Source",
    "leadStatus": "Lead Status",
    "opportunityName": "Opportunity Name",
    "opportunityValue": "Opportunity Value",
    "opportunityStatus": "Opportunity Status",
    "campaignName": "Campaign Name",
    "campaignChannel": "Campaign Channel",
    "customerName": "Customer Name",
    "customerPhone": "Customer Phone",
    "customerEmail": "Customer Email",
    "taskTitle": "Task Title",
    "taskStatus": "Task Status",
    "taskPriority": "Task Priority"
  },
  "leads": {
    "triggers": {
      "created": {
        "label": "Lead Created",
        "description": "Fires when a new lead is created."
      },
      "updated": {
        "label": "Lead Updated"
      },
      "statusChanged": {
        "label": "Lead Status Changed",
        "description": "Fires when a lead moves from one status to another."
      },
      "assigned": {
        "label": "Lead Assigned"
      }
    },
    "conditions": {
      "status": "Lead Status",
      "source": "Lead Source",
      "assignedUser": "Assigned User",
      "tags": "Tags"
    },
    "actions": {
      "changeStatus": {
        "label": "Change Lead Status"
      },
      "assignUser": {
        "label": "Assign User"
      },
      "addTag": {
        "label": "Add Tag"
      },
      "removeTag": {
        "label": "Remove Tag"
      },
      "createOpportunity": {
        "label": "Create Opportunity"
      }
    },
    "fields": {
      "fromStatus": "From Status",
      "toStatus": "To Status",
      "newStatus": "New Status",
      "assignedUser": "Assigned User",
      "tag": "Tag"
    }
  },
  "opportunities": {
    "triggers": {
      "created": {
        "label": "Opportunity Created"
      },
      "statusChanged": {
        "label": "Opportunity Status Changed"
      },
      "won": {
        "label": "Opportunity Won"
      },
      "lost": {
        "label": "Opportunity Lost"
      }
    },
    "conditions": {
      "status": "Opportunity Status",
      "value": "Opportunity Value",
      "owner": "Owner"
    },
    "actions": {
      "changeStatus": {
        "label": "Change Status"
      },
      "assignUser": {
        "label": "Assign User"
      },
      "create": {
        "label": "Create Opportunity"
      },
      "addNote": {
        "label": "Add Note"
      }
    },
    "fields": {
      "toStatus": "New Status",
      "newStatus": "New Status",
      "note": "Note"
    }
  },
  "outreach": {
    "triggers": {
      "started": {
        "label": "Campaign Started"
      },
      "customerAdded": {
        "label": "Customer Added"
      },
      "messageSent": {
        "label": "Message Sent"
      },
      "messageDelivered": {
        "label": "Message Delivered"
      },
      "messageRead": {
        "label": "Message Read"
      },
      "messageReplied": {
        "label": "Message Replied"
      },
      "customerExited": {
        "label": "Customer Exited"
      },
      "completed": {
        "label": "Campaign Completed"
      }
    },
    "conditions": {
      "channel": "Campaign Channel"
    },
    "actions": {
      "sendWhatsapp": {
        "label": "Send WhatsApp"
      },
      "sendGmail": {
        "label": "Send Gmail"
      },
      "sendMessenger": {
        "label": "Send Messenger"
      },
      "removeCustomer": {
        "label": "Remove Customer From Campaign"
      },
      "stopForCustomer": {
        "label": "Stop Campaign For Customer"
      }
    },
    "fields": {
      "campaign": "Campaign",
      "phoneNumber": "Phone Number",
      "template": "Template",
      "mailbox": "Mailbox",
      "subject": "Subject",
      "message": "Message",
      "messengerPage": "Messenger Page"
    }
  },
  "tasks": {
    "triggers": {
      "created": {
        "label": "Task Created"
      },
      "assigned": {
        "label": "Task Assigned"
      },
      "due": {
        "label": "Task Due"
      },
      "overdue": {
        "label": "Task Overdue"
      },
      "completed": {
        "label": "Task Completed"
      }
    },
    "conditions": {
      "priority": "Priority",
      "status": "Status",
      "assignedUser": "Assigned User"
    },
    "actions": {
      "create": {
        "label": "Create Task"
      },
      "assign": {
        "label": "Assign Task"
      },
      "changeStatus": {
        "label": "Change Status"
      },
      "changePriority": {
        "label": "Change Priority"
      }
    },
    "fields": {
      "title": "Title",
      "description": "Description",
      "assignedTo": "Assigned To",
      "priority": "Priority",
      "newStatus": "New Status"
    }
  },
  "notifications": {
    "actions": {
      "send": {
        "label": "Send Notification"
      }
    },
    "fields": {
      "recipient": "Recipient",
      "message": "Message"
    }
  },
  "templates": {
    "followUpNewLead": {
      "label": "Follow Up New Lead",
      "description": "Wait 10 minutes after a new lead is created, then create a follow-up task."
    },
    "retargetNoReply": {
      "label": "Retarget No Reply",
      "description": "After sending a campaign message, wait up to 2 days for a reply, then send a Gmail follow-up if none arrives."
    },
    "highIntentToOpportunity": {
      "label": "High Intent → Opportunity",
      "description": "When a customer replies on WhatsApp, create an opportunity and a follow-up task."
    },
    "taskOverdueReminder": {
      "label": "Overdue Task Reminder",
      "description": "Notify when a task becomes overdue."
    },
    "wonDealFollowUp": {
      "label": "Won Deal Follow-up",
      "description": "Wait 1 day after winning an opportunity, then create a follow-up task."
    }
  },
  "center": {
    "pageTitle": "Automation Center",
    "pageDescription": "Build and manage cross-module workflows from one place.",
    "createWorkflow": "Create Workflow",
    "emptyWorkflows": "No workflows yet.",
    "useTemplate": "Use Template",
    "untitled": "Untitled workflow",
    "deleteSuccess": "Workflow deleted",
    "confirmDeleteTitle": "Delete this workflow?",
    "confirmDeleteMessage": "This removes the local draft permanently. This cannot be undone.",
    "executionsNotAvailableTitle": "No execution history yet",
    "executionsNotAvailableDescription": "There is no backend automation engine connected yet, so workflows don't actually run — see WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md.",
    "logsNotAvailableTitle": "No logs yet",
    "logsNotAvailableDescription": "Execution logs will appear here once a backend automation engine exists.",
    "tabs": {
      "workflows": "Workflows",
      "templates": "Templates",
      "executions": "Executions",
      "logs": "Logs"
    },
    "columns": {
      "workflow": "Workflow",
      "module": "Module",
      "trigger": "Trigger",
      "status": "Status",
      "lastRun": "Last Run",
      "executions": "Executions",
      "updated": "Updated",
      "actions": "Actions"
    }
  }
}
