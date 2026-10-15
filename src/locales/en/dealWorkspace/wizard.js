export default {
  "wizard": {
    "title": "New deal",
    "description": "Create the deal step by step: its stages, first data, products and team. Your answers stay as a draft in this browser until the deal is created.",
    "stepsLabel": "Creation steps",
    "next": "Next",
    "back": "Back",
    "cancel": "Cancel",
    "create": "Create deal",
    "retry": "Retry",
    "finish": "Finish creating",
    "startOver": "Start over",
    "startOverMessage": "Clear every answer and start again?",
    "startOverCreated": "The deal was already created. Starting over only clears this draft; the deal stays.",
    "lockedNote": "The deal is already created. Finish the remaining requests from the review step.",
    "steps": {
      "pipeline": {
        "title": "Deal stages",
        "hint": "Pipeline",
        "description": "The stages every lead of this deal moves through. Pick a saved pipeline or define new stages."
      },
      "basics": {
        "title": "First data",
        "hint": "Name, period, targets",
        "description": "What the deal is, when it runs, its targets and who owns it."
      },
      "products": {
        "title": "Products",
        "hint": "What it sells",
        "description": "The product or products this deal works on. Their number and unit data decide how the workspace sells them."
      },
      "team": {
        "title": "Team",
        "hint": "Users and teams",
        "description": "Who works on the deal: users or whole teams, each with a role."
      },
      "review": {
        "title": "Review & create",
        "hint": "Check and send",
        "description": "Check everything, then create. The requests run in order; if one fails, retry continues from it."
      },
      "source": {
        "title": "Lead source",
        "hint": "Campaigns or leads",
        "description": "Where the deal leads come from: one or more linked campaigns, or leads you pick from the CRM or add now."
      }
    },
    "pipeline": {
      "choice": "Stages source",
      "existing": {
        "title": "Use a saved pipeline",
        "description": "Pick one of the company's pipeline templates."
      },
      "new": {
        "title": "Define new stages",
        "description": "Create a new pipeline template now; it will be saved for later deals too."
      },
      "noTemplates": "No saved pipelines yet. Define new stages instead.",
      "stagesHint": "Order the stages from first contact to closing. Mark one stage as won and one as lost.",
      "defaultStages": {
        "0": "New lead",
        "1": "Negotiation",
        "2": "Won",
        "3": "Lost"
      },
      "nameHint": "The pipeline name as it will show when picked for later deals.",
      "typeHint": "The kind of deals this pipeline suits."
    },
    "basics": {
      "namePlaceholder": "e.g. Q4 Sales Deal",
      "ownerHint": "The person accountable for the deal.",
      "typeHints": {
        "sales": "Selling to leads over a period.",
        "campaign": "Leads coming from a marketing campaign.",
        "project": "A project with a defined scope."
      },
      "hints": {
        "name": "A clear name that tells this deal apart; it shows in lists, the deals board and on leads.",
        "description": "Optional: the goal of the deal and anything the team needs (project, offer, terms).",
        "status": {
          "draft": "Draft: still being set up; the team does not work on it yet.",
          "active": "Active: the team works on it now and it counts in target tracking.",
          "paused": "Paused: leads stay as they are, no new work.",
          "completed": "Completed: the work on it is done.",
          "cancelled": "Cancelled: it will not be worked on."
        },
        "startDate": "When work starts; shown on the calendar.",
        "endDate": "When the deal ends; days left and delays are counted from it.",
        "targetLeads": "How many leads you plan to bring into the deal.",
        "targetRevenue": "Total value of target contracts; progress is measured against it."
      }
    },
    "products": {
      "selected": "{{count}} selected",
      "none": "No products yet. You can add them later from the deal.",
      "unitNote": "A product sold as one piece (a villa, a specific car) can be won once. A product with several identical units (5 cars of the same spec) can be sold in quantities. This comes from the product data."
    },
    "team": {
      "addOwner": "Add the owner ({{name}}) as manager",
      "none": "No members yet. You can add them later from the deal.",
      "search": "Search…",
      "noMatch": "No results.",
      "membersCount": "{{count}} members",
      "ownerLocked": "Deal owner — added as manager",
      "addOwnerHint": "The owner joins as manager automatically, even if not picked in the list.",
      "teams": {
        "title": "Pick a ready team",
        "description": "Everyone in the team joins the deal with the role you set.",
        "emptyTitle": "No teams yet",
        "emptyDescription": "Create a quick team now and it joins the deal right away, or build the team from users next to this section."
      },
      "users": {
        "title": "Build a team from users",
        "description": "Pick people by name and set each one's role.",
        "emptyTitle": "No users",
        "emptyDescription": "There are no users to show."
      },
      "rolesTitle": "What each role means",
      "roleHints": {
        "manager": "Runs the deal: distributes leads, sees everything, edits settings.",
        "sales_rep": "Works the leads assigned to them: contact, follow-up, win and loss.",
        "viewer": "Sees the deal and its reports without editing."
      },
      "summary": "Sent in one request: {{users}} users and {{teams}} teams.",
      "quick": {
        "open": "New team",
        "openEmpty": "Create a quick team",
        "title": "Create a quick team",
        "description": "Create a new sales team for the company; it joins this deal as soon as it is created.",
        "name": "Team name",
        "namePlaceholder": "e.g. Villas sales team",
        "nameHint": "Shows in the teams list and can be picked for later deals.",
        "leader": "Team leader (optional)",
        "leaderHint": "Joins the team automatically; distribution rules can target them later.",
        "noLeader": "No leader",
        "leaderMember": "Team leader",
        "members": "Team members ({{count}})",
        "replaceUsers": "Replace the picked users with the new team",
        "replaceUsersHint": "Users now inside the team are no longer listed one by one in the deal; they join with the team and its role.",
        "footnote": "The team is created as an active \"Sales\" team. You can change its type and members later in Leads Center → Sales teams.",
        "submit": "Create and add to the deal",
        "created": "\"{{name}}\" created and added to the deal",
        "failed": "Could not create the team",
        "noId": "The team was created but its id was not returned. Pick it from the list once it refreshes."
      }
    },
    "review": {
      "edit": "Edit",
      "newTemplate": "new",
      "requestsTitle": "What will be created",
      "requests": {
        "template": "Pipeline template",
        "deal": "Deal",
        "products": "Products ({{count}})",
        "teamBatch": "Team ({{users}} users, {{teams}} teams)",
        "campaigns": "Link campaigns ({{count}})",
        "existingLeads": "CRM leads ({{count}})",
        "newLeads": "New leads ({{sent}}/{{count}})"
      },
      "stoppedAt": "Stopped:",
      "failed": "The request failed.",
      "noTemplateId": "The pipeline was created but its id was not returned.",
      "noDealId": "The deal was created but its id was not returned.",
      "resumeNote": "The deal exists. Retrying only sends what is left.",
      "teamSummary": "{{users}} users and {{teams}} teams",
      "source": {
        "campaigns": "Linked to {{count}} campaigns",
        "leads": "{{existing}} CRM leads and {{created}} new leads",
        "later": "Leads later from the deal page"
      },
      "leadsFailed": "{{count}} leads were not added:",
      "leadsFailedHint": "\"Retry\" sends only these leads.",
      "finishWithoutFailed": "Open the deal without them"
    },
    "errors": {
      "templateRequired": "Choose a pipeline.",
      "pipelineNameRequired": "Pipeline name is required.",
      "nameRequired": "Deal name is required.",
      "endBeforeStart": "The end date is before the start date.",
      "negative": "Cannot be negative.",
      "duplicateMember": "The same member is listed twice.",
      "incompleteMember": "Every member needs a person/team and a role.",
      "quickTeamNameRequired": "The team name is required.",
      "quickTeamMembersRequired": "Pick at least one member.",
      "sourceRequired": "Choose a lead source.",
      "campaignsRequired": "Pick at least one campaign.",
      "leadsRequired": "Add at least one lead, or choose \"Later\".",
      "leadRowsInvalid": "Some new leads have problems; fix or delete them.",
      "tooManyLeads": "Creation takes up to 300 new leads; add the rest from the deal page.",
      "leadNameRequired": "Name required",
      "leadPhoneRequired": "Phone required",
      "leadPhoneInvalid": "Invalid number",
      "leadPhoneDuplicate": "Duplicate number",
      "leadEmailInvalid": "Invalid email"
    },
    "guide": {
      "label": "About this step",
      "toggle": "How does this step work?",
      "exampleLabel": "Example:",
      "pipeline": {
        "title": "Deal stages: the path every lead follows",
        "points": {
          "what": {
            "title": "What are stages?",
            "text": "Every lead in the deal moves through the stages in order, from first contact to closing. They become the columns of the deal board."
          },
          "existing": {
            "title": "Saved pipeline",
            "text": "Pick it when the company already has stages that fit this kind of deal. The deal takes a copy of its stages."
          },
          "new": {
            "title": "New stages",
            "text": "Define them when this deal needs a different path. They are saved as a pipeline you can reuse for later deals."
          },
          "wonLost": {
            "title": "Won and lost stages",
            "text": "Mark one stage as won and one as lost. Moving a lead there opens the closing dialog; a win creates the contract and payment plan."
          },
          "later": {
            "title": "Can I change them later?",
            "text": "Yes, from the deal settings, but changing stages that already hold leads needs care, so it is best to set them right now."
          },
          "lostReasons": {
            "title": "Lead lost reasons",
            "text": "Define the reasons your team picks when a single lead in the deal is lost — not for losing the whole deal. They are company-wide and save at once; edit them later in the deal settings → Lead lost reasons."
          }
        },
        "example": "A villas deal: New lead → Site visit → Negotiation → Reservation → Won / Lost."
      },
      "basics": {
        "title": "First data: what the deal is and what it aims for",
        "points": {
          "what": {
            "title": "Why this data?",
            "text": "The name and description show wherever the deal or its leads appear; the targets are what reports measure the deal against."
          },
          "type": {
            "title": "Type",
            "text": "Sales: selling to leads over a period. Campaign: leads from a marketing campaign. Project: a defined scope such as a real-estate project. Used for filters and reports."
          },
          "period": {
            "title": "Period",
            "text": "Start and end show on the calendar, and tell whether the deal is on track or behind its target."
          },
          "targets": {
            "title": "Targets",
            "text": "Leads target: how many leads you plan to bring into the deal. Revenue target: the total value of expected contracts. Both are optional, but without them no progress is shown."
          },
          "owner": {
            "title": "Owner",
            "text": "The person accountable for the deal result. They can join the team as manager automatically in step 4."
          }
        },
        "example": "Name \"Villa 12 — New Cairo\", type Project, 1 Nov to 31 Dec, 30 leads and 9M target."
      },
      "products": {
        "title": "Products: what this deal sells",
        "points": {
          "what": {
            "title": "Why products?",
            "text": "Products decide how selling works in the deal: what the win dialog offers, the allowed quantities, and what goes into the contract."
          },
          "single": {
            "title": "One piece",
            "text": "A unique product such as a villa or a specific car: quantity is always 1 and the deal can be won once."
          },
          "units": {
            "title": "One product in units",
            "text": "One product with identical units, e.g. 5 cars of the same spec: only quantity and price change."
          },
          "multi": {
            "title": "Several products",
            "text": "Each lead can take any of the deal products with its own quantities."
          },
          "later": {
            "title": "No products yet?",
            "text": "You can skip and add products later from the deal products page."
          }
        },
        "example": "A \"Sedan cars\" deal with the product \"Sedan X\" and 5 units available."
      },
      "team": {
        "title": "Team: who works on the deal",
        "points": {
          "what": {
            "title": "Why a team?",
            "text": "Only team members get the deal leads distributed to them, see its workspace and appear in its performance reports."
          },
          "teams": {
            "title": "A ready team or a quick team",
            "text": "Pick a defined sales team and all its members join the deal with the role you set. No fitting team? \"Create a quick team\" creates one now and adds it to the deal right away."
          },
          "users": {
            "title": "Build a team from users",
            "text": "If no team fits, pick people by name and set each one's role. You can combine both ways."
          },
          "roles": {
            "title": "Roles",
            "text": "Manager runs the deal and distributes leads. Sales rep works the leads assigned to them. Viewer can only look."
          },
          "notify": {
            "title": "What happens on create?",
            "text": "The whole team is sent in one request and each member is notified. You can change the team later from the team page."
          }
        },
        "example": "Pick \"Team A\" as sales reps and add \"Karim\" by name as manager."
      },
      "review": {
        "title": "Review and create",
        "points": {
          "what": {
            "title": "Check before sending",
            "text": "Each section shows your answers; \"Edit\" takes you back to the step without losing anything."
          },
          "order": {
            "title": "Order of creation",
            "text": "The pipeline (if new), then the deal, then the whole team in one request, then the products. The side list shows each request's state."
          },
          "retry": {
            "title": "If a request fails",
            "text": "Creation stops there and keeps what was done. \"Retry\" continues from the failed request and never creates a second deal."
          },
          "after": {
            "title": "After creating",
            "text": "The deal workspace opens right away so you can start adding leads."
          }
        },
        "example": "If the team request fails, the deal stays created and the retry sends only the team and products."
      },
      "source": {
        "title": "Lead source: where leads come from",
        "points": {
          "what": {
            "title": "Why this step?",
            "text": "A deal without leads has nothing to work. Decide now where they come from; you can change it later."
          },
          "campaigns": {
            "title": "Linked to campaigns",
            "text": "Pick one or more campaigns. \"Activate the link\" lets the campaign leads enter the deal; turn it off to prepare the deal first."
          },
          "free": {
            "title": "Free deal",
            "text": "Search the Leads Center by name or phone and click a lead to add it. They are all added in one request."
          },
          "newLeads": {
            "title": "New leads",
            "text": "Type them one by one, paste columns from Excel, or pick a file. Missing and duplicate numbers show in red so you fix them before creating."
          },
          "owner": {
            "title": "Owner and stage",
            "text": "Choose who follows these leads and which stage they start in, or leave no owner to distribute them later."
          },
          "later": {
            "title": "Later",
            "text": "No source yet? Choose \"Later\" and add leads from the deal page."
          }
        },
        "example": "A \"New Cairo villas\" deal linked to the \"Ramadan\" and \"Retargeting\" campaigns, or a free deal with an Excel file of 120 visitors from an exhibition."
      }
    },
    "source": {
      "modeLabel": "Deal lead source",
      "modes": {
        "campaigns": {
          "title": "Linked to campaigns",
          "text": "The deal works one or more ad campaigns; their leads enter the deal."
        },
        "leads": {
          "title": "Free deal with leads",
          "text": "Pick leads already in the CRM, or add new ones by typing, pasting from Excel or uploading a file."
        },
        "later": {
          "title": "Later",
          "text": "Create the deal now and add leads or link a campaign from the deal page."
        }
      },
      "laterNote": "No leads are added now. After creating, add them from the deal's \"Leads\" page.",
      "campaigns": {
        "title": "Pick campaigns",
        "description": "The company campaigns in the CRM; a deal can be linked to several.",
        "search": "Search campaigns",
        "active": "Active",
        "inactive": "Paused",
        "emptyTitle": "No campaigns",
        "emptyDescription": "Create a campaign in the Campaign Center first, or choose \"Free deal with leads\".",
        "selected": "Picked campaigns ({{count}})",
        "none": "No campaign picked yet.",
        "activeLabel": "Activate the link now",
        "activeHint": "On: the campaign leads enter the deal from now. You can pause or resume the link per campaign later."
      },
      "leads": {
        "owner": "Leads owner",
        "ownerHint": "Every lead added here is assigned to them. No owner: distribute them later from the deal.",
        "noOwner": "No owner (distribute later)",
        "stage": "Starting stage",
        "stageHint": "The stage the CRM leads start in.",
        "stageNewPipeline": "New pipeline: leads start in the first stage.",
        "firstStage": "First stage",
        "addTitle": "Add leads",
        "addDescription": "Pick from the CRM or add new leads; they all gather in the list beside.",
        "ways": {
          "crm": "From CRM",
          "type": "Type",
          "paste": "Paste",
          "file": "File"
        },
        "search": "Search leads",
        "searchPlaceholder": "Name or phone…",
        "searchHint": "Type at least two characters to search the Leads Center. Click a lead to add or remove it.",
        "searchFailed": "Search failed. Try again.",
        "addAllResults": "Add all results ({{count}})",
        "emailOptional": "Email (optional)",
        "enterHint": "Enter adds the lead and starts a new one.",
        "addOne": "Add",
        "pasteLabel": "Paste rows here",
        "pasteHint": "Copy columns from Excel or Google Sheets (name, phone, email, company). A header row is optional, in any order.",
        "pastePlaceholder": "Name\tPhone\nAhmed Ali\t01001234567",
        "readPaste": "Read rows",
        "fileLabel": "Choose an Excel or CSV file",
        "fileHint": "First sheet only. Columns: name and phone (email and company optional). Format the phone column as Text in Excel so the leading 0 is kept. The file is read here, not uploaded as is.",
        "fileButton": "Choose file",
        "fileFailed": "Could not read the file. Make sure it is xlsx or csv.",
        "nothingFound": "No leads found in the input.",
        "added": "{{count}} leads added to the list.",
        "cut": "Only {{added}} of {{total}} added: creation takes up to 300 new leads.",
        "basketTitle": "Deal leads",
        "basketSummary": "{{existing}} from CRM · {{created}} new (up to {{max}})",
        "basketEmpty": "The list is empty. Search the CRM or add new leads.",
        "fromCrm": "From CRM ({{count}})",
        "newRows": "New leads ({{count}})",
        "clearNew": "Clear new",
        "remove": "Remove",
        "removeInvalid": "Delete invalid rows ({{count}})"
      }
    }
  },
  "productMode": {
    "deal": {
      "open": {
        "title": "No products yet",
        "description": "Any catalog product can be added to a lead. Add products to the deal to lock how it sells."
      },
      "single_unit": {
        "title": "One piece",
        "description": "The deal sells one unique piece. Every lead negotiates the same product, quantity is always 1, and the deal can be won once."
      },
      "single_product": {
        "title": "One product in units",
        "description": "The deal sells one product. Every lead negotiates that product; only the quantity and price change."
      },
      "multi_product": {
        "title": "Several products",
        "description": "Each lead can take any of the deal's products with its own quantities."
      }
    },
    "unit": {
      "unique": "One piece",
      "units": "Units",
      "service": "Service"
    },
    "unitsCount": "{{count}} units",
    "availableUnits": "{{count}} units available",
    "productsCount": "{{count}} products",
    "fixedQuantityHint": "One piece: the quantity is always 1.",
    "uniqueTaken": "This piece is already won by another lead. It cannot be won again.",
    "unitSoldNotice": "{{name}} is already won. The other leads can only be closed as lost."
  }
}
