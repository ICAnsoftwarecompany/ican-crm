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
      }
    },
    "basics": {
      "namePlaceholder": "e.g. Q4 Sales Deal",
      "ownerHint": "The person accountable for the deal.",
      "typeHints": {
        "sales": "Selling to leads over a period.",
        "campaign": "Leads coming from a marketing campaign.",
        "project": "A project with a defined scope."
      }
    },
    "products": {
      "selected": "{{count}} selected",
      "none": "No products yet. You can add them later from the deal.",
      "unitNote": "A product sold as one piece (a villa, a specific car) can be won once. A product with several identical units (5 cars of the same spec) can be sold in quantities. This comes from the product data."
    },
    "team": {
      "addOwner": "Add the owner ({{name}}) as manager",
      "none": "No members yet. You can add them later from the deal."
    },
    "review": {
      "edit": "Edit",
      "newTemplate": "new",
      "teamCount": "{{count}} members",
      "requestsTitle": "What will be created",
      "requests": {
        "template": "Pipeline template",
        "deal": "Deal",
        "team": "Team member: {{kind}} · {{role}}",
        "products": "Products ({{count}})"
      },
      "stoppedAt": "Stopped:",
      "failed": "The request failed.",
      "noTemplateId": "The pipeline was created but its id was not returned.",
      "noDealId": "The deal was created but its id was not returned.",
      "resumeNote": "The deal exists. Retrying only sends what is left."
    },
    "errors": {
      "templateRequired": "Choose a pipeline.",
      "pipelineNameRequired": "Pipeline name is required.",
      "nameRequired": "Deal name is required.",
      "endBeforeStart": "The end date is before the start date.",
      "negative": "Cannot be negative.",
      "duplicateMember": "The same member is listed twice.",
      "incompleteMember": "Every member needs a person/team and a role."
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
