// Sales teams area (/LeadsCenter/teams/*, features/leads/sales-teams): teams, distribution rules, rule builder, reports. 2026-10-15, area + builder 2026-10-16.
export default {
  "nav": {
    "title": "Sales teams",
    "description": "Teams and lead distribution",
    "menu": "Sales teams menu",
    "expand": "Expand menu",
    "collapse": "Collapse menu",
    "manage": "Manage",
    "teams": "Teams",
    "rules": "Distribution rules",
    "newRule": "New distribution rule",
    "insights": "Insights",
    "reports": "Reports & statistics",
    "backToLeads": "Leads Center"
  },
  "kpis": {
    "teams": "Teams",
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
    "general": {
      "label": "General",
      "hint": "A general team with no specific focus."
    },
    "sales": {
      "label": "Sales",
      "hint": "Receives leads and works them until won or lost."
    },
    "support": {
      "label": "Support",
      "hint": "Handles customer requests and issues."
    },
    "collections": {
      "label": "Collections",
      "hint": "Follows up on installments and late payments."
    },
    "onboarding": {
      "label": "Onboarding",
      "hint": "Takes the customer after the win and sets them up."
    },
    "operations": {
      "label": "Operations",
      "hint": "Delivers and runs services after the sale."
    }
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
    "saveFailed": "Could not save the team",
    "pageTitle": "Teams",
    "pageDescription": "Build your sales teams: name, type, leader and members. Then route each team its leads with distribution rules."
  },
  "assignTypes": {
    "round_robin": {
      "label": "Round robin",
      "description": "Leads rotate evenly between the team members, one after another."
    },
    "team": {
      "label": "To the team",
      "description": "The lead goes to the whole team; any member can pick it up."
    },
    "team_leader": {
      "label": "To the team leader",
      "description": "The lead goes to the team leader, who then hands it out."
    },
    "user": {
      "label": "To a specific user",
      "description": "The lead goes straight to one user you choose (e.g. VIP leads)."
    }
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
    "edit": "Edit rule",
    "name": "Rule name",
    "namePlaceholder": "e.g. Facebook Ramadan leads",
    "nameForTeam": "{{team}} leads",
    "fallbackName": "Rule #{{id}}",
    "priority": "Priority",
    "anyValue": "Any",
    "allLeads": "All leads",
    "assignType": "Assign type",
    "targetTeam": "Team",
    "targetUser": "User",
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
    "saveFailed": "Could not save the rule",
    "pageTitle": "Distribution rules",
    "pageDescription": "Each rule says which leads (by source or campaign) go to whom and how. Rules are listed by priority."
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
  },
  "builder": {
    "newTitle": "New distribution rule",
    "editTitle": "Edit rule: {{name}}",
    "description": "Step by step: the rule name, which leads it applies to, how they are handed out, who receives them, and the priority. The side panel explains each step and shows the rule as you build it.",
    "cancel": "Cancel and back to rules",
    "back": "Back",
    "next": "Next",
    "backToRules": "Back to distribution rules",
    "notFound": "This rule does not exist or was removed",
    "stepsLabel": "Rule steps",
    "stepOf": "Step {{current}} of {{total}}",
    "helpTitle": "What to do here",
    "exampleLabel": "Example",
    "summaryTitle": "Rule summary",
    "unnamed": "Unnamed rule",
    "sentence": {
      "when": "When a lead arrives:",
      "then": "It goes:",
      "noTeam": "No team chosen yet",
      "noUser": "No user chosen yet"
    },
    "steps": {
      "basics": {
        "short": "Name",
        "title": "Name the rule",
        "intro": "A clear name describing the leads this rule distributes, so you find it easily in the list.",
        "help": "The name is for display only and does not affect distribution. Pick one that says where the leads come from or where they go.",
        "tips": {
          "tip1": "Use the campaign or source name: \"Facebook Ramadan leads\".",
          "tip2": "For special customers: \"VIP leads\".",
          "tip3": "You can rename it any time later."
        },
        "example": "Facebook ads leads - Ramadan"
      },
      "conditions": {
        "short": "Target leads",
        "title": "Which leads does the rule apply to?",
        "intro": "Set the conditions a lead must meet for the rule to catch it. Every condition narrows the leads further.",
        "help": "An empty condition means \"any value\". With every condition empty the rule catches every new lead, which is useful as a low-priority catch-all.",
        "tips": {
          "tip1": "Source: the channel the lead came from (Facebook, WhatsApp...).",
          "tip2": "Campaign, ad and form: only the leads of a specific ad or form.",
          "tip3": "Picking a campaign narrows the ads to that campaign."
        },
        "example": "Source = Facebook and campaign = Ramadan → only Ramadan campaign leads from Facebook."
      },
      "method": {
        "short": "Assign type",
        "title": "How are the leads handed out?",
        "intro": "Choose how a lead reaches its receiver.",
        "help": "Round robin spreads leads evenly over the team members. To the team makes the lead available to the whole team. To the team leader sends it to the leader, who hands it out. To a specific user sends it to one person.",
        "tips": {
          "tip1": "Round robin suits a sales team that wants a fair split.",
          "tip2": "Team leader suits a leader who reviews every lead first.",
          "tip3": "Specific user suits VIP customers or a special source."
        },
        "example": "3 members, round robin: lead 1 to Mona, 2 to Omar, 3 to Sara, 4 to Mona again."
      },
      "target": {
        "short": "Receiver",
        "title": "Who receives the leads?",
        "intro": "Choose the team (or the user when the type is \"To a specific user\"). Below you see exactly who gets them.",
        "help": "The team must be active and have members (or a leader for \"To the team leader\"), otherwise leads reach nobody. Warnings show up here.",
        "tips": {
          "tip1": "If the team does not exist, create it on the Teams page first.",
          "tip2": "Team members are edited on the Teams page, not here.",
          "tip3": "The preview is illustrative; the actual distribution runs on the server."
        }
      },
      "priority": {
        "short": "Priority",
        "title": "Priority and activation",
        "intro": "When a lead matches several rules, priority orders them. You see where your rule sits among the active rules.",
        "help": "Rules are listed highest priority first. Give precise rules (a campaign or form) a higher priority than general ones (a source only, or all leads).",
        "tips": {
          "tip1": "If a rule above catches the same leads, yours may never apply; you will be warned.",
          "tip2": "\"Use suggested priority\" puts it above the broader rules.",
          "tip3": "You can save the rule inactive and activate it later from the list."
        },
        "example": "Ramadan campaign = 20, all Facebook = 10, all leads = 0."
      },
      "review": {
        "short": "Review",
        "title": "Review and save",
        "intro": "Check everything. Jump back to any step with the \"Edit\" link next to it.",
        "help": "Once saved (and active), the rule applies to new leads from now on. Existing leads are not redistributed.",
        "tips": {
          "tip1": "Check the warnings in the side summary.",
          "tip2": "Editing an existing rule affects upcoming leads only."
        }
      }
    },
    "basics": {
      "nameHint": "The name shows in the rules list and the summary only.",
      "ideas": "Name ideas",
      "nameIdeas": {
        "facebookLeads": "Facebook leads",
        "whatsappLeads": "WhatsApp leads",
        "vipLeads": "VIP leads",
        "campaignLeads": "Campaign leads",
        "everythingElse": "All other leads"
      }
    },
    "conditions": {
      "hints": {
        "source": "The channel the lead came from.",
        "campaign_id": "A specific CRM ad campaign.",
        "ad_id": "A specific ad (narrowed to the chosen campaign).",
        "form_id": "A specific lead form."
      },
      "narrowed": "The rule catches leads that meet all {{count}} conditions.",
      "narrowed_one": "The rule catches only leads that meet this condition.",
      "catchAll": "No conditions: the rule catches every new lead. Keep its priority low so precise rules apply first."
    },
    "method": {
      "whenTitle": "When to use \"{{type}}\"?",
      "when": {
        "round_robin": "When you have a sales team and want every member to get about the same number of leads, without anyone assigning by hand.",
        "team": "When the team works together and any free member can pick up the lead.",
        "team_leader": "When the leader wants to see every lead and decide who follows it up.",
        "user": "When these leads need one specific person, such as VIP customers or a user's own form."
      },
      "nextTeam": "Next step: choose the team.",
      "nextUser": "Next step: choose the user."
    },
    "target": {
      "noTeams": "No teams yet. Create a team on the Teams page first.",
      "nextLeads": "Preview: the next leads go to",
      "leadNumber": "Lead {{number}}",
      "sharedNote": "The lead becomes available to every team member; whoever picks it up follows it."
    },
    "priority": {
      "useSuggested": "Use suggested priority ({{value}})",
      "activeHint": "while inactive it distributes nothing",
      "position": "Position among active rules: {{position}} of {{total}}",
      "moreAbove": "and {{count}} rules above",
      "moreBelow": "and {{count}} rules below",
      "thisRule": "This rule",
      "inactiveNote": "The rule is inactive, so it is not part of this order until activated.",
      "shadowed": "Rules above catch the same leads or more: {{names}}. If the first matching rule wins, this rule will get no leads. Raise its priority.",
      "duplicate": "An active rule has exactly the same conditions: {{names}}.",
      "tie": "Same priority as: {{names}}. Their order is not guaranteed."
    },
    "review": {
      "edit": "Edit",
      "editField": "Edit {{field}}",
      "note": "Saving sends the rule to the server; the distribution itself runs there on new leads."
    }
  },
  "reports": {
    "title": "Sales teams reports",
    "description": "Team sizes, users without a team, and how the distribution rules split across assign types, sources and teams.",
    "note": "Based on the current teams and rules. The actual lead split per user is in the Leads Center reports.",
    "kpis": {
      "activeTeams": "Active teams",
      "averageSize": "{{value}} people per team on average",
      "activeRules": "Active rules",
      "catchAll": "{{count}} of them for all leads",
      "needsAttention": "Needs attention",
      "needsAttentionHint": "{{rules}} rules with a warning · {{teams}} teams without a rule"
    },
    "charts": {
      "teamSizes": "Team sizes",
      "byAssignType": "Active rules by assign type",
      "bySource": "Active rules by source",
      "byTeam": "Active rules by team",
      "teamsByType": "Teams by type"
    },
    "series": {
      "members": "Members",
      "leader": "Leader",
      "rules": "Rules",
      "teams": "Teams"
    }
  }
}
