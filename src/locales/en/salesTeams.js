// Sales teams + lead distribution rules (/LeadsCenter/teams, features/leads/sales-teams), 2026-10-15.
export default {
  "title": "Sales teams & lead distribution",
  "description": "Build sales teams with a leader and members, then define how new leads are routed to a team or to a specific user.",
  "tabs": {
    "teams": "Teams",
    "rules": "Distribution rules"
  },
  "kpis": {
    "teams": "Teams",
    "rules": "Distribution rules",
    "users": "Users",
    "unassigned": "Without a team",
    "unassignedHint": "Not a leader or member of any team",
    "activeOf": "{{count}} active"
  },
  "common": {
    "active": "Active",
    "inactive": "Inactive",
    "loading": "Loading...",
    "noResults": "No matching results",
    "save": "Save changes"
  },
  "filters": {
    "allTypes": "All types",
    "allStatuses": "All statuses",
    "allAssignTypes": "All assign types",
    "status": "Status",
    "clear": "Clear filters"
  },
  "teamTypes": {
    "general": { "label": "General", "hint": "A general team with no specific focus." },
    "sales": { "label": "Sales", "hint": "Receives leads and works them until won or lost." },
    "support": { "label": "Support", "hint": "Handles customer requests and issues." },
    "collections": { "label": "Collections", "hint": "Follows up on installments and late payments." },
    "onboarding": { "label": "Onboarding", "hint": "Takes the customer after the win and sets them up." },
    "operations": { "label": "Operations", "hint": "Delivers and runs services after the sale." }
  },
  "teams": {
    "new": "New team",
    "create": "Create team",
    "createTitle": "Create a team",
    "editTitle": "Edit team",
    "edit": "Edit team",
    "editNamed": "Edit team {{name}}",
    "dialogDescription": "The team name, type, leader and the members who will receive leads.",
    "name": "Team name",
    "namePlaceholder": "e.g. Cairo sales team",
    "type": "Team type",
    "typeLocked": "The team type is set on creation only.",
    "leader": "Team leader",
    "noLeader": "No leader",
    "activeLabel": "Team is active and receives leads",
    "members": "Members",
    "membersCount": "{{count}} members",
    "membersCount_one": "1 member",
    "noMembers": "No members yet",
    "searchPlaceholder": "Search by team, leader or member",
    "searchUsers": "Search by user name or email",
    "noUsers": "No matching users",
    "selectShown": "Select shown",
    "unselectShown": "Unselect shown",
    "receivesFrom": "Receives from {{count}} active rules",
    "receivesFrom_one": "Receives from 1 active rule",
    "noRules": "No distribution rule targets this team",
    "addRule": "Distribution rule",
    "emptyTitle": "No teams yet",
    "emptyDescription": "Create your first team, pick its leader and members, then route leads to it with a distribution rule.",
    "created": "Team created",
    "updated": "Team saved",
    "saveFailed": "Could not save the team"
  },
  "assignTypes": {
    "round_robin": { "label": "Round robin", "description": "Leads rotate evenly between the team members, one after another." },
    "team": { "label": "To the team", "description": "The lead goes to the whole team; any member can pick it up." },
    "team_leader": { "label": "To the team leader", "description": "The lead goes to the team leader, who then hands it out." },
    "user": { "label": "To a specific user", "description": "The lead goes straight to one user you choose (e.g. VIP leads)." }
  },
  "conditions": {
    "source": "Source",
    "campaign_id": "Campaign",
    "ad_id": "Ad",
    "form_id": "Lead form"
  },
  "sources": {
    "facebook": "Facebook",
    "messenger": "Messenger",
    "whatsapp": "WhatsApp",
    "lead_form": "Lead form",
    "website": "Website",
    "google": "Google",
    "referral": "Referral",
    "manual": "Manual",
    "other": "Other"
  },
  "rules": {
    "new": "New distribution rule",
    "create": "Create rule",
    "createTitle": "New distribution rule",
    "editTitle": "Edit distribution rule",
    "edit": "Edit rule",
    "dialogDescription": "Choose which leads the rule applies to, who receives them and how.",
    "name": "Rule name",
    "namePlaceholder": "e.g. Facebook Ramadan leads",
    "nameForTeam": "{{team}} leads",
    "fallbackName": "Rule #{{id}}",
    "priority": "Priority",
    "priorityHint": "Whole number, higher is listed first",
    "conditionsTitle": "Target leads",
    "conditionsHint": "Leave a condition empty to accept any value. With every condition empty the rule applies to all leads.",
    "anyValue": "Any",
    "allLeads": "All leads",
    "assignType": "Assign type",
    "targetTeam": "Team",
    "targetUser": "User",
    "teamPreview": "The team has {{count}} members besides the leader.",
    "teamPreview_one": "The team has 1 member besides the leader.",
    "teamLeaderPreview": "Leads will go to {{name}}.",
    "activeLabel": "Rule is active",
    "activate": "Activate rule",
    "deactivate": "Deactivate rule",
    "activated": "Rule activated",
    "deactivated": "Rule deactivated",
    "searchPlaceholder": "Search by rule, team or campaign",
    "emptyTitle": "No distribution rules",
    "emptyDescription": "Without rules, new leads are not distributed automatically. Add a rule per source or campaign.",
    "created": "Rule created",
    "updated": "Rule saved",
    "saveFailed": "Could not save the rule"
  },
  "guide": {
    "title": "How does lead distribution work?",
    "step1": "When a new lead arrives (ad, form, WhatsApp...) the server looks for active rules whose conditions match it.",
    "step2": "An empty condition accepts any value. Rules are listed by priority, highest first.",
    "step3": "The matching rule decides who receives the lead, by its assign type:",
    "backendNote": "The distribution itself runs on the server; this page only defines the rules."
  },
  "warnings": {
    "missingTeam": "No team selected",
    "missingUser": "No user selected",
    "inactiveTeam": "The team is inactive, leads will not reach it",
    "noLeader": "The team has no leader",
    "emptyTeam": "The team has no members",
    "unknownUser": "The user is not in the users list"
  },
  "errors": {
    "nameRequired": "Name is required",
    "typeRequired": "Choose the team type",
    "assignTypeRequired": "Choose the assign type",
    "teamRequired": "Choose the team",
    "userRequired": "Choose the user",
    "priorityInvalid": "Priority must be a whole number, 0 or more"
  }
}
