export default {
  "settings": {
    "sections": {
      "general": "General",
      "generalHint": "Name, status, dates, targets and owner.",
      "stages": "Stages",
      "stagesHint": "The stages of this deal.",
      "preferences": "Preferences",
      "preferencesHint": "How the workspace looks for you.",
      "danger": "Delete",
      "dangerHint": "Delete this deal."
    },
    "save": "Save",
    "saved": "Deal saved.",
    "saveFailed": "Could not save the deal.",
    "stagesNote": "Stages were copied from the pipeline template when the deal was created. Editing the template does not change this deal.",
    "wonStage": "Won stage",
    "lostStage": "Lost stage",
    "manageTemplates": "Manage pipeline templates",
    "browserOnly": "Saved in this browser only.",
    "defaultView": "Default pipeline view",
    "planned": {
      "lostReasons": "Custom lost reasons",
      "paymentDefaults": "Default payment terms",
      "cardFields": "Fields shown on lead cards",
      "notifications": "Notifications of the deal team",
      "stageRules": "Rules per stage (required fields, SLA)"
    },
    "delete": "Delete deal",
    "deleteHint": "Deleting a deal removes its workspace. This cannot be undone.",
    "deleteTitle": "Delete deal",
    "deleteMessage": "Delete {{name}}? This cannot be undone.",
    "deleted": "Deal deleted.",
    "deleteFailed": "Could not delete the deal."
  },
  "form": {
    "title": "New deal",
    "description": "Each deal gets its own workspace: leads, team, products, contracts and reports.",
    "save": "Create deal",
    "created": "Deal created.",
    "createFailed": "Could not create the deal.",
    "templateHint": "The deal copies this template's stages.",
    "templateLocked": "Cannot change after creation.",
    "errors": {
      "nameRequired": "Name is required.",
      "pipelineRequired": "Choose a pipeline.",
      "endBeforeStart": "The end date is before the start date."
    }
  },
  "pipelines": {
    "description": "Templates of stages. A new deal copies its template's stages; later edits do not change existing deals.",
    "newTitle": "New pipeline",
    "editTitle": "Edit pipeline",
    "dialogHint": "One won stage and one lost stage are recommended.",
    "name": "Pipeline name",
    "stageName": "Stage name",
    "stageColor": "Stage color",
    "addStage": "Add stage",
    "removeStage": "Remove stage",
    "moveUp": "Move up",
    "moveDown": "Move down",
    "stagesCount": "{{count}} stages",
    "nameRequired": "Pipeline name is required.",
    "stagesRequired": "Add at least one named stage.",
    "created": "Pipeline created.",
    "updated": "Pipeline updated.",
    "saveFailed": "Could not save the pipeline.",
    "edit": "Edit",
    "delete": "Delete",
    "deleteTitle": "Delete pipeline",
    "deleteMessage": "Delete {{name}}? Deals created from it keep their stages.",
    "deleted": "Pipeline deleted.",
    "deleteFailed": "Could not delete the pipeline.",
    "emptyTitle": "No pipelines yet",
    "emptyDescription": "Create a pipeline before creating deals.",
    "defaultStages": {
      "0": "New",
      "1": "Won",
      "2": "Lost"
    },
    "errors": {
      "noStages": "Add at least one named stage.",
      "noOpenStage": "Add at least one working stage (not won or lost).",
      "manyWon": "Only one won stage.",
      "manyLost": "Only one lost stage.",
      "duplicateNames": "Two stages have the same name."
    }
  }
}
