# Assignment API adapter

Updated: 2026-11-13 00:19 (Africa/Cairo).

`assignmentApi.js` maps the 12 requests in the supplied Service Postman subset to the shared authenticated `httpClient`. POST is intentionally used for rule updates, matching the collection. The adapter must not hardcode tokens or TenantSecret. Response envelopes and supported entity types require backend confirmation.
