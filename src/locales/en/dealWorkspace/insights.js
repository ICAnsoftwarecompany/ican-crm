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
  }
}
