export default {
  "activities": {
    "pickLead": "Lead",
    "scopeNote": "Shows the latest 200 calls and meetings of the company that are linked to this deal or its leads.",
    "scopes": {
      "all": "All",
      "customer": "With customers",
      "internal": "Internal"
    },
    "status": {
      "scheduled": "Scheduled",
      "pending": "Pending",
      "in_progress": "In progress",
      "completed": "Completed",
      "cancelled": "Cancelled",
      "missed": "Missed",
      "no_show": "No show",
      "rescheduled": "Rescheduled"
    },
    "meeting": {
      "description": "Meetings with the deal's customers and internal meetings of the deal team.",
      "withCustomer": "Meeting with a customer",
      "internal": "Team meeting",
      "internalTitle": "Deal team meeting",
      "emptyTitle": "No meetings yet",
      "emptyDescription": "Schedule a meeting with a customer of the deal or with the team."
    },
    "call": {
      "description": "Calls with the customers of this deal.",
      "withCustomer": "Call a customer",
      "emptyTitle": "No calls yet",
      "emptyDescription": "Schedule a call with one of the deal's leads."
    }
  },
  "tasks": {
    "tabs": {
      "deal": "Deal tasks & to-dos",
      "leads": "Lead follow-ups ({{count}})",
      "contracts": "Contract follow-ups ({{count}})"
    },
    "todoPlaceholder": "Add a to-do for this deal...",
    "when": "When",
    "whenOptions": {
      "today": "Today",
      "tomorrow": "Tomorrow",
      "week": "This week",
      "month": "This month"
    },
    "addTodo": "Add",
    "todoAdded": "To-do added.",
    "todoFailed": "Could not add the to-do.",
    "noOpen": "No open tasks.",
    "showClosed": "Show {{count}} closed",
    "hideClosed": "Hide closed",
    "leadsEmpty": "No lead follow-ups",
    "leadsEmptyHint": "Tasks created on the deal's leads appear here.",
    "contractsEmpty": "No contract follow-ups",
    "contractsEmptyHint": "When a lead is won, the system creates delivery and installment reminder tasks here."
  },
  "calendar": {
    "installment": "Installment",
    "dealStart": "Deal starts",
    "dealEnd": "Deal ends",
    "sources": {
      "installments": "Installments",
      "milestones": "Deal dates"
    }
  },
  "dealGroups": {
    "new": "New group",
    "newTitle": "New deal group",
    "newDescription": "An internal chat group for the deal team; it shows in the deal groups because its name is built from the deal name.",
    "create": "Create group",
    "nameLabel": "Group name:",
    "nameHint": "Fixed name: the deal name + the next group number. The deal finds its groups by it.",
    "members": "Members ({{count}})",
    "inTeam": "In the deal team",
    "membersRequired": "Pick at least one member.",
    "created": "\"{{name}}\" created",
    "createFailed": "Could not create the group",
    "linkNote": "Groups named \"{{name}} G\" + a number show here. Renaming the deal or the group unlinks it.",
    "title": "Deal groups ({{count}})",
    "panelTitle": "Deal groups ({{count}})",
    "emptyTitle": "No groups for this deal",
    "emptyDescription": "Create \"{{name}}\" for the deal team."
  },
  "chatDock": {
    "conversations": "Customer conversations",
    "groups": "Deal groups and team chat",
    "scope": "Conversations scope",
    "scopes": {
      "deal": "Deal customers",
      "all": "All conversations"
    },
    "scopeHint": "Conversations of the deal's {{count}} customers (by linked lead or customer, phone or email).",
    "noCustomers": "The deal has no customers yet, so no conversations show.",
    "channels": {
      "whatsapp": "WhatsApp",
      "messenger": "Messenger",
      "gmail": "Gmail"
    },
    "openPage": "Open the deal conversations page"
  },
  "dealConversations": {
    "scopeNote": "Only conversations of the deal's customers show here ({{count}}): linked to a lead or customer of the deal, or to their phone or email. The latest loaded conversations of each channel are searched.",
    "noCustomers": "This deal has no customers yet; add leads to see their conversations here."
  }
}
