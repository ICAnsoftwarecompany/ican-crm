export default {
  "pages": {
    "view": "View",
    "create": "Create",
    "reports": "Reports",
    "calendar": "Calendar",
    "automation": "Automation",
    "customization": "Customization",
    "ai": "AI setup",
    "settings": "Settings"
  },
  "groups": {
    "work": "Work",
    "insights": "Insights",
    "setup": "Setup"
  },
  "create": {
    "bindingHint": "You can link the activity to a lead, customer or deal from inside the form."
  },
  "reports": {
    "kpis": {
      "total": {
        "call": "Calls in period",
        "meeting": "Meetings in period"
      },
      "completed": "Completed",
      "completionRate": "Completion rate",
      "overdue": "Overdue",
      "unreadMessages": "Unread messages",
      "activeConversations": "Active conversations",
      "activeChannels": "Channels with conversations",
      "groups": "Groups"
    },
    "charts": {
      "perDay": {
        "call": "Calls per day by status",
        "meeting": "Meetings per day by status"
      },
      "byAssignee": "By assignee",
      "byPriority": "By priority",
      "byOutcome": "By outcome",
      "conversationActivity": "Conversation activity per day by channel",
      "unreadByChannel": "Unread by channel",
      "conversationsByChannel": "Conversations by channel",
      "chatActivity": "Team chat activity per day",
      "byConversationType": "Direct vs groups",
      "unreadByConversation": "Conversations with most unread"
    },
    "series": {
      "call": "Calls",
      "meeting": "Meetings",
      "unread": "Unread",
      "conversations": "Conversations"
    },
    "conversationTypes": {
      "group": "Groups",
      "direct": "Direct"
    },
    "noOutcomes": "No outcomes recorded in this period",
    "noUnread": "No unread messages"
  },
  "modules": {
    "conversations": {
      "title": "Conversations",
      "description": "WhatsApp, Messenger and Gmail in one inbox",
      "menu": "Conversations menu",
      "calendarNotice": "Conversations have no dated source yet. Scheduled items (such as scheduled messages and follow-ups) will appear here once the backend provides them.",
      "calendarDescription": "Dates related to conversations.",
      "automationDescription": "Automatic rules for conversations: assignment, replies, tags.",
      "settingsDescription": "Conversation settings and connected channels.",
      "create": {
        "title": "New conversation",
        "description": "Start a conversation with a customer on any connected channel.",
        "items": {
          "channel": "Choose the channel (WhatsApp, Messenger, Gmail)",
          "contact": "Pick the lead or customer",
          "template": "Send an approved WhatsApp template message",
          "assign": "Set the agent who owns the conversation"
        }
      },
      "reports": {
        "title": "Conversation reports",
        "description": "Response, channel and agent performance."
      },
      "customization": {
        "description": "Customize the conversations inbox.",
        "items": {
          "quickReplies": "Quick replies",
          "labels": "Conversation labels",
          "channelsOrder": "Channel order and visibility",
          "threadColumns": "Fields shown in the conversation list"
        }
      },
      "ai": {
        "pageDescription": "What AI may do inside conversations.",
        "suggestReplies": {
          "label": "Suggest replies",
          "description": "Suggests a reply the agent reviews before sending."
        },
        "summarizeThread": {
          "label": "Summarize the thread",
          "description": "A short summary of any long thread."
        },
        "detectIntent": {
          "label": "Detect intent",
          "description": "Detects whether the customer is asking, complaining or ready to buy."
        },
        "autoTag": {
          "label": "Auto-tag",
          "description": "Adds labels to the conversation based on its content."
        },
        "autoReply": {
          "label": "Auto-reply",
          "description": "Answers common questions outside working hours."
        }
      },
      "settingsItems": {
        "assignment": "Assign new conversations to agents",
        "businessHours": "Business hours and after-hours replies",
        "sla": "Maximum response time",
        "closing": "Auto-close inactive conversations"
      }
    },
    "calls": {
      "title": "Calls",
      "description": "Sales and customer service calls",
      "menu": "Calls menu",
      "calendarNotice": "This area has no dated source yet.",
      "calendarDescription": "Every scheduled call on the calendar.",
      "automationDescription": "Automatic rules for calls: reminders, follow-ups, tasks.",
      "settingsDescription": "Call settings and users.",
      "create": {
        "title": "New call",
        "description": "Schedule a call with a lead or customer.",
        "items": {
          "form": "Call scheduling form"
        }
      },
      "reports": {
        "title": "Call reports",
        "description": "Call volume, outcomes and team performance."
      },
      "customization": {
        "description": "Tailor calls to how your team works.",
        "items": {
          "outcomes": "Call outcomes",
          "reportFields": "Call report fields",
          "tableColumns": "Calls table columns",
          "priorities": "Priority levels"
        }
      },
      "ai": {
        "pageDescription": "What AI may do in calls.",
        "prepareBrief": {
          "label": "Pre-call brief",
          "description": "A summary of the customer and last contact before dialing."
        },
        "summarizeCall": {
          "label": "Summarize the call",
          "description": "Drafts the call report."
        },
        "suggestNextAction": {
          "label": "Suggest the next action",
          "description": "Suggests a follow-up, a meeting or a status change."
        },
        "scoreOutcome": {
          "label": "Score the outcome",
          "description": "Estimates how close the customer is to buying."
        }
      },
      "settingsItems": {
        "outcomes": "Available call outcomes",
        "reminders": "Default reminder timing",
        "requiredReport": "Require a report after every call",
        "recording": "Call recording (once a telephony provider is connected)"
      }
    },
    "meetings": {
      "title": "Meetings",
      "description": "Customer and internal meetings",
      "menu": "Meetings menu",
      "calendarNotice": "This area has no dated source yet.",
      "calendarDescription": "Every scheduled meeting on the calendar.",
      "automationDescription": "Automatic rules for meetings: reminders, reports, tasks from decisions.",
      "settingsDescription": "Meeting settings and users.",
      "create": {
        "title": "New meeting",
        "description": "Schedule a customer meeting or an internal team meeting.",
        "items": {
          "form": "Meeting scheduling form"
        }
      },
      "reports": {
        "title": "Meeting reports",
        "description": "Meeting volume, outcomes and team performance."
      },
      "customization": {
        "description": "Tailor meetings to your team.",
        "items": {
          "meetingTypes": "Meeting types (customer / internal)",
          "reportTemplates": "Meeting report templates",
          "agendaTemplates": "Agenda templates",
          "tableColumns": "Meetings table columns"
        }
      },
      "ai": {
        "pageDescription": "What AI may do in meetings.",
        "prepareAgenda": {
          "label": "Prepare the agenda",
          "description": "Suggests an agenda from the customer or deal context."
        },
        "summarizeMeeting": {
          "label": "Summarize the meeting",
          "description": "Drafts the minutes or the after-meeting report."
        },
        "extractActionItems": {
          "label": "Extract action items",
          "description": "Turns decisions into suggested tasks."
        },
        "suggestNextAction": {
          "label": "Suggest the next action",
          "description": "Suggests a customer follow-up or a new meeting."
        }
      },
      "settingsItems": {
        "types": "Meeting types and privacy of internal ones",
        "reminders": "Default reminder timing",
        "reports": "After-meeting report template",
        "kpi": "Exclude internal meetings from sales KPIs"
      }
    },
    "team-chat": {
      "title": "Team chat",
      "description": "Team and group messaging",
      "menu": "Team chat menu",
      "calendarNotice": "Team chat has no dated source yet. Reminders and scheduled messages will appear here once the backend provides them.",
      "calendarDescription": "Dates related to team chat.",
      "automationDescription": "Automatic rules for chat: alerts, scheduled messages, tasks from messages.",
      "settingsDescription": "Team chat settings and users.",
      "create": {
        "title": "New chat or group",
        "description": "Start a chat with a colleague or create a team group.",
        "items": {
          "direct": "Direct chat with a colleague",
          "group": "Group with a name and members",
          "linked": "Group linked to a deal or service case",
          "permissions": "Add and admin permissions"
        }
      },
      "reports": {
        "title": "Team chat reports",
        "description": "Team activity in chat."
      },
      "customization": {
        "description": "Customize team chat.",
        "items": {
          "channelTypes": "Group types",
          "reactions": "Available reactions",
          "pinnedLimits": "Pinned message limits",
          "notificationDefaults": "Default notification settings"
        }
      },
      "ai": {
        "pageDescription": "What AI may do in team chat.",
        "summarizeUnread": {
          "label": "Summarize unread",
          "description": "A summary of what the user missed in groups."
        },
        "suggestReplies": {
          "label": "Suggest replies",
          "description": "Suggests a quick reply to a colleague."
        },
        "createTasksFromMessages": {
          "label": "Create tasks from messages",
          "description": "Turns a request in chat into a suggested task."
        }
      },
      "settingsItems": {
        "retention": "Message retention period",
        "groups": "Who can create groups",
        "attachments": "Allowed attachment types and size",
        "notifications": "Default notifications for new users"
      }
    }
  }
}
