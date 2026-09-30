# features/service/workflow — Customer Hub in the Workflow Engine (F6)

Spec §18: Customer Service has **no workflow engine of its own**. It registers its triggers, conditions,
actions and variables in the app's engine (`features/workflow-engine`) through `registerWorkflowModule`.

| Path | Role |
|---|---|
| `serviceWorkflowDefinition.js` | Registers the `customer_service` module plus its fixed data sources. It is loaded by one import line in `workflow-engine/config/registerBuiltinModules.js`. |
| `serviceWorkflowDefinition.test.js` | Checks that every id is unique, that every label key exists in ar/en, and that every `source` is registered. |

- **Triggers:** `case.created`, `case.status_changed`, `case.sla_at_risk`, `case.sla_breached`,
  `case.resolved`, `feedback.low_score`, `follow_up.outcome_recorded`, `record.status_changed`,
  `subscription.renewal_window`, `health.band_changed`, `portal.request_created`.
  Event name = `service.<id>`.
- **Conditions:** priority, channel, case type, AI sentiment, customer health band. AI signals are *inputs*;
  the workflow decides (spec §45.1).
- **Actions:** create case, set priority, assign, internal note, reply to customer, enroll in follow-up,
  queue quality review, post portal update.
- **Data sources:** `service_priorities`, `service_sentiments`, `service_health_bands`,
  `service_survey_types`, `service_channels`. These are fixed lists registered with
  `registerDataSource(key, { options })`. The engine gained an `options` field for this;
  `useDataSourceOptions` returns them.

Everything is `backendSupport: false`. The builder shows the items, but the backend must ship the service
events (spec §6) and actions (§18.2) before a workflow actually runs. Copy lives in `locales/*/service/workflow.js`.
