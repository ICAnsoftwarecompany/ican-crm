export default {
  "empty": {
    "title": "Nothing to show yet",
    "description": "This flow has no steps yet."
  },
  "categories": {
    "triggers": "Triggers",
    "logic": "Logic",
    "actions": "Actions",
    "timing": "Timing",
    "data": "Data",
    "flowControl": "Flow Control",
    "ai": "AI",
    "utilities": "Utilities"
  },
  "nodes": {
    "start": {
      "label": "Start"
    },
    "end": {
      "label": "End"
    },
    "group": {
      "label": "Group",
      "labelField": "Label"
    },
    "data": {
      "label": "Data",
      "labelField": "Label"
    }
  },
  "unknownNode": {
    "title": "Unknown node"
  },
  "library": {
    "title": "Node Library",
    "search": "Search nodes...",
    "noResults": "No nodes found"
  },
  "properties": {
    "title": "Properties",
    "emptyHint": "Select a node to configure it.",
    "noFields": "This node needs no configuration.",
    "selectPlaceholder": "Select..."
  },
  "execution": {
    "title": "Execution",
    "noData": "No execution data.",
    "id": "Execution ID",
    "startedAt": "Started At",
    "finishedAt": "Finished At",
    "status": "Status",
    "selectedNode": "Selected Node",
    "error": "Error",
    "output": "Output"
  },
  "executionStates": {
    "idle": "Idle",
    "queued": "Queued",
    "running": "Running",
    "success": "Success",
    "failed": "Failed",
    "skipped": "Skipped",
    "waiting": "Waiting",
    "cancelled": "Cancelled"
  },
  "toolbar": {
    "undo": "Undo",
    "redo": "Redo",
    "autoLayout": "Auto Layout",
    "validate": "Validate",
    "toggleMinimap": "Toggle Minimap",
    "fullscreen": "Fullscreen",
    "save": "Save"
  },
  "validation": {
    "allGood": "No issues found",
    "errorsTitle": "Errors",
    "warningsTitle": "Warnings",
    "noSelfConnection": "A node can't connect to itself",
    "duplicateConnection": "This connection already exists",
    "portMaxConnections": "This port has reached its connection limit",
    "portTypeMismatch": "These ports can't be connected",
    "duplicateId": "Duplicate node ID",
    "fieldRequired": "The \"{{field}}\" field is required",
    "customError": "{{message}}",
    "disconnectedNode": "This node has no incoming connection",
    "noOutgoingConnection": "This node has no outgoing connection",
    "triggerRequired": "A trigger node is required",
    "cycleDetected": "This flow contains a circular connection"
  }
}
