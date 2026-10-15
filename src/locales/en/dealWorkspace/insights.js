export default {
  "overview": {
    "kpis": {
      "open": "Open leads",
      "won": "Won",
      "lost": "Lost",
      "revenue": "Contracts value",
      "pipelineValue": "Pipeline value {{value}}",
      "contracts": "{{count}} contracts"
    },
    "paceTitle": "Pace against the revenue target",
    "timeElapsed": "Time elapsed",
    "targetAchieved": "Target achieved",
    "paceBehind": "The deal is behind its target for the time passed.",
    "paceOk": "The deal is on pace.",
    "byStage": "Open leads by stage",
    "attention": "Needs attention",
    "allGood": "Nothing needs attention right now.",
    "upcoming": "Coming up",
    "openCalendar": "Open calendar",
    "nothingUpcoming": "No upcoming tasks, calls or meetings."
  },
  "insights": {
    "unassignedLeads": "{{count}} open leads have no owner.",
    "staleLeads": "{{count}} open leads had no activity for 7+ days.",
    "overdueInstallments": "{{count}} installments are overdue.",
    "leadsWithoutValue": "{{count}} open leads have no estimated value (add their products).",
    "behindTarget": "Revenue is {{count}} points behind the time passed.",
    "noLeads": "This deal has no leads yet.",
    "actions": {
      "pipeline": "Open pipeline",
      "contracts": "Open contracts",
      "reports": "Open reports"
    }
  },
  "reports": {
    "kpis": {
      "created": "Leads added",
      "won": "Won",
      "winRate": "Win rate",
      "winRateHint": "Won out of closed in the period",
      "revenue": "Contracts value",
      "pipelineHint": "Open pipeline {{value}}"
    },
    "charts": {
      "createdOverTime": "Leads added per day",
      "closedOverTime": "Won and lost per day",
      "byStage": "Open leads by stage",
      "byStatus": "Leads by status",
      "bySource": "New leads by source",
      "byOwner": "Open leads by owner",
      "lostReasons": "Lost reasons"
    },
    "series": {
      "created": "Added",
      "leads": "Leads"
    }
  },
  "assistant": {
    "hintsTitle": "Hints",
    "hintsNote": "Computed from the deal's data with fixed rules — not AI.",
    "askTitle": "Ask the assistant",
    "placeholder": "Ask about this deal...",
    "send": "Send",
    "noAnswer": "No answer.",
    "failed": "The assistant could not answer.",
    "suggested": {
      "summary": "Summarize this deal",
      "nextActions": "What should we do next?",
      "risks": "Which leads are at risk?",
      "followUp": "Draft a follow-up message"
    }
  },
  "ai": {
    "capabilities": {
      "summarizeDeal": {
        "label": "Summarize the deal",
        "description": "A short status of leads, contracts and pace."
      },
      "nextBestAction": {
        "label": "Next best action",
        "description": "Suggest what to do next for each open lead."
      },
      "scoreLeads": {
        "label": "Score leads",
        "description": "Rank open leads by how likely they are to close."
      },
      "draftFollowUp": {
        "label": "Draft follow-ups",
        "description": "Write WhatsApp or email follow-ups for a lead."
      },
      "forecastRevenue": {
        "label": "Forecast revenue",
        "description": "Estimate the revenue by the deal's end date."
      },
      "detectRisks": {
        "label": "Detect risks",
        "description": "Flag stale leads, late installments and pace problems."
      }
    }
  },
  "analytics": {
    "updated": "Updated {{time}}",
    "refresh": "Refresh",
    "openDeal": "Open deal",
    "emptyTitle": "No numbers",
    "emptyDescription": "The server returned no data for this deal.",
    "kpis": {
      "total": "Total leads",
      "open": "Open",
      "won": "Won",
      "lost": "Lost",
      "revenue": "Revenue",
      "achievement": "Target achieved",
      "winRate": "Win rate",
      "daysLeft": "Days left",
      "ofTarget": "of {{value}} target ({{percent}})",
      "noTarget": "No target",
      "winRateHint": "Win rate {{value}}",
      "targetRevenue": "Target {{value}}",
      "achievementHint": "Revenue ÷ target revenue",
      "achievementOf": "Target achieved {{value}}",
      "winRateFormula": "Won ÷ (won + lost)",
      "elapsed": "{{percent}}% of {{days}} days passed",
      "noPeriod": "No period"
    },
    "progress": {
      "leads": "Leads of target",
      "revenue": "Revenue of target",
      "time": "Time passed"
    },
    "charts": {
      "stages": "Leads per stage",
      "stagesHint": "From the server stage summary",
      "status": "Lead status",
      "owners": "Owners performance",
      "allTime": "All time (from the server)"
    },
    "owners": {
      "title": "Owners performance",
      "description": "Leads, won and revenue per owner in the deal.",
      "owner": "Owner",
      "emptyTitle": "No owners yet",
      "emptyDescription": "Performance shows once the deal leads are assigned to team members."
    }
  },
  "completeness": {
    "label": "Completeness",
    "title": "Deal setup completeness",
    "of": "{{done}} of {{total}}",
    "unknownNote": "Some items are not loaded yet for this deal (products, team or leads) and are not counted.",
    "items": {
      "description": "Description",
      "period": "Start and end dates",
      "targetLeads": "Target leads",
      "targetRevenue": "Target revenue",
      "owner": "Deal owner",
      "stages": "Stages (pipeline template)",
      "products": "Products",
      "team": "Team",
      "leads": "Leads"
    }
  }
}
