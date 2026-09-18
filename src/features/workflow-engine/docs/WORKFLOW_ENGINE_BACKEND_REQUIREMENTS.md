# Workflow Engine — Backend Requirements

This lists only what the **frontend Workflow Engine assumes but the backend does not currently provide**. Everything here is a recommendation for future backend work, not a description of an existing API. Confirmed-existing APIs the engine already reuses (WhatsApp send, Gmail send, task CRUD, lead status/tag actions, campaign customer removal) are documented in each module's `*WorkflowDefinition.js` file and in `WORKFLOW_ENGINE_ARCHITECTURE_AR.md`, not repeated here.

## Why none of this exists yet

No domain-event system, workflow persistence API, or execution engine exists anywhere in this codebase today (verified by search before building the frontend — see the architecture doc's "Backend Gaps" section). The frontend therefore only ever writes to local browser storage (Zustand + `persist`, see `hooks/useWorkflowStore.js`) and never claims a workflow is "running."

## Recommended API surface

```
GET    /workflows
POST   /workflows
GET    /workflows/{id}
PUT    /workflows/{id}
DELETE /workflows/{id}

POST   /workflows/{id}/activate
POST   /workflows/{id}/pause
POST   /workflows/{id}/duplicate

GET    /workflows/{id}/executions
GET    /workflow-executions/{id}
GET    /workflow-executions/{id}/logs
```

### Workflow payload shape

The frontend domain model (`core/workflowDomainModel.js`) is ready to be the request/response contract as-is:

```json
{
  "id": 15,
  "name": "Follow up interested leads",
  "description": "",
  "module": "leads",
  "context": { "module": "leads", "entity": "lead" },
  "status": "active",
  "trigger": { "definitionId": "lead.status_changed", "config": { "to_status": "3" } },
  "nodes": [ { "id": "trigger", "type": "trigger", "definitionId": "lead.status_changed", "config": {} } ],
  "edges": [ { "from": "trigger", "to": "step_123", "branch": null } ],
  "settings": {},
  "createdBy": 5,
  "createdAt": "2026-09-18T12:00:00Z",
  "updatedAt": "2026-09-18T12:00:00Z"
}
```

`utils/workflowGraph.js`'s `workflowToNodesEdges()` already converts the frontend's editable step-tree into this exact `nodes`/`edges` shape — no frontend change would be needed to start POSTing it once an endpoint exists.

## Domain model

```
Workflow
  └─ WorkflowVersion       (editing an active workflow must not affect already-running executions)
       └─ WorkflowExecution
            └─ WorkflowNodeExecution
```

**Versioning is mandatory, not optional**: if a tenant edits an active workflow while 100 customers are mid-sequence on the old version, those in-flight executions must keep running against the version they started on. Activating a new version should not retroactively change already-running executions.

## Event Bus

Domain modules must publish events; the Workflow Engine subscribes and matches them against active workflows' triggers. Do not directly couple a module's service to a workflow service (e.g. `LeadService` must never call `CampaignWorkflowService` directly).

Recommended event names (already used as trigger `eventName`/`id` values in the frontend registry — keep these names if adopted, since every module definition file already hard-codes them):

```
lead.created, lead.updated, lead.status_changed, lead.assigned
opportunity.created, opportunity.status_changed, opportunity.activated, opportunity.dismissed
campaign.started, campaign.customer_added, campaign.message_sent, campaign.message_delivered,
campaign.message_read, campaign.message_replied, campaign.customer_exited, campaign.completed
task.created, task.assigned, task.due, task.overdue, task.completed
```

## Action Executors

The engine should orchestrate, never own business logic:

```
Workflow Engine → "execute opportunity.create" → Opportunity Action Handler → Opportunity Service → Database
```

NOT: `Workflow Engine → directly inserts into the opportunities table`.

Recommended action executor registry (id → real handler), matching the frontend's action definition ids exactly so no id renaming is needed on either side:

```
task.create, task.assign, task.change_status
lead.change_status, lead.assign_user, lead.add_tag, lead.remove_tag
opportunity.create, opportunity.change_status, opportunity.assign_user, opportunity.add_note   (requires Opportunities to get a real backend first — see below)
outreach.send_whatsapp, outreach.send_gmail, outreach.remove_customer, outreach.stop_campaign_for_customer
outreach.send_messenger   (requires a real Messenger send API first — none exists today, see architecture doc)
notification.send         (requires a Notifications feature to exist first — none exists today)
```

## Scheduler / Queue

Required for:
- `wait` nodes (duration or until-date).
- `wait_for_event` nodes' timeout branch.
- Trigger evaluation from the event bus without blocking the request that published the event.

## Variable Resolution

The frontend's `{{customer.name}}`-style variables (`utils/workflowVariables.js`) are preview-only, using hardcoded sample data. Real interpolation must happen server-side at send/execute time, resolving against the actual triggering record. The frontend never sends interpolated text — only the raw template string plus the workflow context.

## Versioning, Retry, Idempotency, Loop Protection

- **Idempotency**: retrying a failed action (e.g. `task.create`, `outreach.send_whatsapp`) after a worker crash must not create duplicates. Recommend an idempotency key derived from `(execution_id, node_id, attempt_group)`.
- **Retry**: `retry` / `timeout` / `failure` / `skip` / `continue` / `stop` outcomes per node execution, recorded with `error_code`, `error_message`, `attempt`, `failed_at`. Retry strategy belongs on backend workers/queues, never in the browser.
- **Loop protection**: an action that mutates a record (e.g. `lead.change_status`) can re-trigger the same event that started the workflow. Require `causation_id`/`correlation_id` propagation and a maximum execution depth per correlation chain, plus duplicate-event detection.

## Permissions

Recommended capability keys (frontend has no enforcement today — no permission system exists anywhere in this app; see architecture doc "Permissions"):

```
automation.view
automation.create
automation.edit
automation.activate
automation.pause
automation.delete
automation.logs.view
```

Also: a user who cannot manually create an Opportunity should not automatically be allowed to configure an `opportunity.create` workflow action, unless product rules explicitly say otherwise. This must be enforced server-side when an entitlement system exists — the frontend cannot enforce a permission system that isn't there yet.

## Tenant Capabilities

Recommended capability keys for future package tiers (frontend has no tenant-package system to key off of today):

```
automation.basic       — trigger + condition + action only
automation.advanced    — branches, wait, wait-for-event, cross-module actions, sequences, advanced logs
automation.cross_module
```

## Blocking dependencies in other modules

- **Opportunities** has no backend at all today (`features/opportunities/api/opportunitiesApi.js` is 100% mock data) — every `opportunity.*` action needs Opportunities itself to ship a real backend before it can be wired to this engine.
- **Messenger ad-hoc send** has no real API today (`messengerMetaApi.js` is dead/commented-out code) — `outreach.send_messenger` needs this before it can execute.
- **Notifications** has no feature at all today — `notification.send` needs a Notifications system built first.
- **Customer Service / Tickets** has no module at all today — no ticket trigger/action definitions were registered in the frontend for this reason (see architecture doc); once it exists, follow the "How to add a new module" guide.
