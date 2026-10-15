export default {
  "hub": {
    "description": "Every deal and its workspace",
    "menu": "Deals menu",
    "pages": {
      "deals": "All deals",
      "contracts": "All contracts",
      "reports": "Reports & statistics",
      "pipelines": "Pipelines",
      "new": "New deal",
      "calendar": "Calendar",
      "overview": "Overview"
    },
    "dealsDescription": "Each deal has its own workspace with its leads, team, products and contracts. Click a deal to open it.",
    "contractsDescription": "Contracts of every deal.",
    "reportsDescription": "Deals, contracts and revenue across the company.",
    "pipelinesDescription": "Stage templates used when creating deals.",
    "reports": {
      "kpis": {
        "active": "Active deals",
        "totalHint": "{{count}} deals in total",
        "created": "Deals created",
        "contracts": "Contracts signed",
        "revenue": "Contracts value",
        "targetHint": "Targets {{value}}"
      },
      "charts": {
        "contractsOverTime": "Contracts per day",
        "byStatus": "Deals by status",
        "byType": "Deals by type",
        "contractsByDeal": "Contracts per deal",
        "setup": "Deal setup"
      },
      "series": {
        "contracts": "Contracts",
        "deals": "Deals"
      },
      "note": "Computed in the browser from {{count}} deals and their contracts.",
      "setup": {
        "ready": "Products and team",
        "noProducts": "No products",
        "noTeam": "No team"
      }
    },
    "viewLabel": "Deals view",
    "calendarDescription": "Every deal on one calendar: start and end dates, contract installments, and the tasks, calls and meetings of every deal.",
    "board": {
      "empty": "No deals",
      "emptyDescription": "Create a deal to see it here.",
      "groupBy": "Columns",
      "groups": {
        "status": "By status",
        "type": "By type"
      },
      "sortBy": "Sort",
      "sorts": {
        "newest": "Newest",
        "endingSoon": "Ending soon",
        "revenue": "Highest revenue target",
        "progress": "Most progress"
      },
      "column": {
        "target": "Target",
        "won": "Won",
        "attention": "{{count}} need attention"
      },
      "card": {
        "health": {
          "onTrack": "On track",
          "behind": "Behind",
          "atRisk": "At risk"
        },
        "healthHint": "Progress to target compared with the time passed in the deal's period",
        "timing": {
          "upcoming": "Starts in {{count}} d",
          "running": "{{count}} d left",
          "endsToday": "Ends today",
          "ended": "Ended {{count}} d ago",
          "endedToday": "Ended today",
          "noEnd": "No end date",
          "noDates": "No dates"
        },
        "elapsed": "{{percent}}% of the period has passed",
        "wonRevenue": "Won revenue (estimated)",
        "noRevenueTarget": "No revenue target",
        "leads": "Leads",
        "pipeline": "Open pipeline",
        "winRate": "Win rate",
        "unassigned": "{{count}} unassigned",
        "stale": "{{count}} without follow-up"
      }
    },
    "overview": {
      "description": "Open one or more deals and see their numbers from the server: leads, won and lost, revenue, stages and owners — or compare them. Open deals and their numbers stay saved in this browser.",
      "openDeals": "Open deals",
      "emptyTitle": "No deal open yet",
      "emptyDescription": "Pick a deal to see its overview; you can open several and switch between them.",
      "tabsLabel": "Open deals",
      "closeTab": "Close {{name}}",
      "compare": "Compare ({{count}})",
      "pickerTitle": "Open deals",
      "pickerHint": "Click a deal to open it in a tab; you can open several (up to 8).",
      "search": "Search deals",
      "compareLeads": "Leads by status",
      "compareRevenue": "Revenue per deal",
      "compareFailed": "Could not load this deal's numbers."
    }
  }
}
