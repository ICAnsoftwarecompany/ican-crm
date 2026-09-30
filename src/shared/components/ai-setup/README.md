# shared/components/ai-setup — shared "AI setup" UI

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — folder created.

**Status:** PARTIAL (UI complete; no AI settings API yet, so values are a per-browser draft) · **Public API:** `index.js` ·
**Tests:** `aiSetupModel.test.js`

One reusable page that lets any module configure how AI behaves inside it: on/off, allowed capabilities, tone,
language, autonomy level (suggest → draft → act), custom instructions and hand-off to a person. Used today by the four
Communication hub modules (`/calls/ai`, `/meetings/ai`, `/conversations/ai`, `/team-chat/ai`).

## Boundary with the future `features/ai` domain

AI will get its own, much larger feature folder (`src/features/ai/`: models/providers, prompts, knowledge sources,
usage limits, audit, the settings API, agents). This folder stays **presentation only**:

| Lives here (shared) | Lives in `features/ai` (future) |
|---|---|
| The page layout, form fields, capability checklist, value model (`normalizeAiSetup`) | Loading/saving settings (API + React Query hooks) |
| A browser-only draft fallback (`useAiSetupDraft`) | Which capabilities a tenant's plan allows, model choice, quotas |
| No knowledge of any module or provider | Running AI features and logging what they did |

When `features/ai` ships an API, a module page switches from draft mode to remote mode by passing props — nothing in
this folder changes:

```jsx
const { data, save, isSaving } = useAiModuleSettings('calls')   // from features/ai (future)
<AiSetupPage scopeKey="calls" capabilities={caps} initialValues={data} onSave={save} isSaving={isSaving} />
```

Existing AI code to align with when that happens: `features/ai-agent` (agent chat UI) and `features/service/ai`
(Customer Hub AI, phase F7).

## API

| Export | Notes |
|---|---|
| `AiSetupPage` | Props: `scopeKey` (stable module id), `capabilities` (`[{ id, label, description }]`, translated), optional `initialValues`, `onSave(values) => Promise`, `isSaving`, `title`, `description`, `icon`. Without `onSave` it saves to `localStorage` (`ican-crm:ai-setup:<scopeKey>`) and shows a warning notice. |
| `AiCapabilityList`, `AiBehaviorFields`, `AiSetupSection`, `AiToggle` | Building blocks if a module needs a custom layout. |
| `useAiSetupDraft` | Browser draft persistence (try/catch around storage). |
| `normalizeAiSetup`, `DEFAULT_AI_SETUP`, `AI_TONES`, `AI_LANGUAGES`, `AI_AUTONOMY_LEVELS`, `toggleCapability`, `getAiSetupStorageKey` | Value model. Unknown capabilities and enum values are dropped/reset. |

Strings: `aiSetup.*` in `src/locales/{ar,en}/aiSetup.js`. Capability labels are owned by the module that lists them
(e.g. `communication.modules.calls.ai.*`).
