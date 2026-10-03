export default {
  "title": "Deals",
  "createDeal": "New deal",
  "empty": "No deals yet. Create the first one to open its workspace.",
  "loading": "Loading deal...",
  "back": "All deals",
  "viewToggle": {
    "kanban": "Board",
    "table": "Table"
  },
  "actions": {
    "workflow": "Automation",
    "ai": "Deal assistant"
  },
  "groups": {
    "work": "Work",
    "collaboration": "Team work",
    "catalog": "Catalog",
    "insights": "Insights",
    "setup": "Setup"
  },
  "pages": {
    "overview": "Overview",
    "pipeline": "Pipeline",
    "contracts": "Contracts",
    "team": "Team",
    "meetings": "Meetings",
    "calls": "Calls",
    "tasks": "Tasks & to-dos",
    "products": "Products",
    "reports": "Reports & statistics",
    "calendar": "Calendar",
    "automation": "Automation",
    "assistant": "Deal assistant",
    "ai": "AI setup",
    "settings": "Settings"
  },
  "pageDescriptions": {
    "overview": "Headline numbers, pace against the target and what needs attention.",
    "pipeline": "The deal's leads by stage, as a board or a table.",
    "contracts": "Contracts created when a lead is won, with their payment plans and installments.",
    "team": "Who works on this deal, their roles, and how the open leads are split.",
    "meetings": "Meetings with the deal's customers and internal team meetings about the deal.",
    "calls": "Calls with the customers of this deal.",
    "tasks": "Deal tasks and to-dos, lead follow-ups and contract follow-ups in one place.",
    "products": "Products this deal sells. They are offered first when a lead is won.",
    "reports": "Leads added, won and lost, win rate and revenue of this deal.",
    "calendar": "Tasks, calls, meetings, installments and the deal's dates on one calendar.",
    "automation": "Automations that run on this deal's events.",
    "assistant": "Hints about the deal and questions to the AI assistant.",
    "ai": "How the AI assistant behaves in every deal workspace.",
    "settings": "Deal details, stages, preferences and deletion."
  },
  "workspace": {
    "description": "Deal workspace",
    "menu": "Deal menu",
    "notFound": "This deal was not found or you cannot open it."
  },
  "header": {
    "leadsTarget": "Leads vs target",
    "revenueTarget": "Won value vs revenue target"
  },
  "fields": {
    "name": "Name",
    "description": "Description",
    "pipeline": "Pipeline",
    "type": "Type",
    "status": "Status",
    "owner": "Owner",
    "leads": "Target leads",
    "revenue": "Target revenue",
    "startDate": "Start date",
    "endDate": "End date",
    "period": "Period",
    "phone": "Phone",
    "email": "Email",
    "company": "Company",
    "stage": "Stage",
    "source": "Source",
    "note": "Note",
    "leadStatus": "Lead status",
    "estimatedValue": "Estimated value",
    "lastActivity": "Last activity"
  },
  "common": {
    "choose": "Choose...",
    "loading": "Loading...",
    "cancel": "Cancel",
    "continue": "Continue",
    "actionFailed": "The action failed. Try again."
  },
  "board": {
    "empty": "No leads in this stage."
  },
  "planned": {
    "generic": "This needs a backend endpoint that is not available yet.",
    "leadsImport": "Importing a file needs the backend endpoint POST /deals/leads/import (planned).",
    "leadsDistribute": "Automatic distribution of leads across the deal team (round robin / by load) needs a backend endpoint (planned). For now, select leads in the table view and assign them.",
    "teamRoleUpdate": "Changing a member's role needs a backend endpoint (planned). For now, remove the member and add them again with the new role.",
    "installmentPayment": "Recording installment payments needs a backend endpoint (planned).",
    "dealLinkedActivities": "Team meetings linked to the deal need the backend to accept the deal as the meeting's linked record.",
    "dealAi": "The AI assistant needs the backend AI endpoints (planned). The hints above are rules computed from the deal's data.",
    "dealSettings": "Workspace settings saved for the whole team need a backend endpoint (planned)."
  }
}
