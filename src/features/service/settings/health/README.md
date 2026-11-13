# Customer Hub Operations Settings — overview readiness

Updated: 2026-11-13 (Africa/Cairo). Route: `/service/settings/health`.

## Live APIs and scoring

The overview queries the existing generic settings resource list APIs plus the two **verified** tenant endpoints `GET /api/tenant/service/assignment-rules` and `GET /api/tenant/service/distribution-settings` via the shared authenticated `assignmentApi`. Both bare arrays and `{ success: true, data: [...] }` response shapes are accepted. No credentials or guessed endpoints are added.

- Each generic resource with a working list API counts as **one** requirement: at least one active record = 100%, none = 0%.
- Assignment rules and distribution settings are scored **per `entity_type`**, independently: active records for each known type count as configured. Known types are the union of entity types returned by both APIs; e.g. rules for ticket, distribution for ticket and shipment => rules 50%, distribution 100%. A newly returned type is included automatically, without hardcoding ticket/shipment.
- Overall percentage = total configured requirements / total verified requirements, including each discovered entity type as one requirement. Each setting displays its own percentage. Malformed, pending and failed responses are unknown, excluded from the denominator. Zero discovered types means the two type-based settings are unknown rather than falsely 100%.
- **Important limitation:** the supplied APIs return configured records, **not an authoritative list of required types**. An entity type absent from both APIs cannot be inferred. Thus 100% means 100% of *discovered* types, not all possible required types. When a verified types endpoint becomes available, supply `expectedTypes` per check from its response; the evaluator already supports this. Do not invent missing types or assume a fixed number.
- This is active-record presence, not validation of assignment rule conditions, strategy semantics, dependencies, permissions, or operational readiness.

Settings without confirmed list APIs are not included. The generic resources retain their prior one-requirement fallback until authoritative subtypes are documented. Query keys match existing resource and assignment panels, so refresh/invalidation can reuse cache.
