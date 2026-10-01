# features/auth — sign-in, session and login methods

_Updated 2026-10-01 23:55 (Africa/Cairo). Full Arabic walkthrough of the page: [pages/auth/README_AR.md](../../pages/auth/README_AR.md)._

## What it owns

- The login page's behaviour (the page itself is composed in `pages/auth/LoginPage.jsx`).
- Session refresh (`SessionRefreshModal`, triggered by `ican:session-expired` from `services/httpClient`).
- Four sign-in methods: username + password (live), Google, Face ID, fingerprint (UI ready, backend pending).

## Files

| Path | Role |
|---|---|
| `api/authApi.js` | Live: `signin`, `refresh`, `logout`. Proposed: Google, WebAuthn, PIN (see contract below). |
| `constants/loginMethods.js` | Method ids, `VITE_AUTH_METHODS` parsing, PIN length. |
| `hooks/useLogin.js` | Password sign-in mutation; `requireToken()` rejects token-less "success". |
| `hooks/useAlternativeLogin.js` | Google start/complete, biometric (WebAuthn) and PIN mutations. |
| `hooks/useCompleteSignIn.js` | Shared success path: store session, remember last username, return to `location.state.from`. |
| `utils/loginError.js` | Maps a failed request to an `auth.errors.*` key (401/422, 403, 404, 423, 429, 5xx, offline). |
| `utils/postLoginRedirect.js` | Safe redirect after sign-in (same-app paths only, never `/login`). |
| `utils/webauthn.js` | base64url ⇄ ArrayBuffer, request-option and assertion (de)serialization. |
| `components/LoginForm.jsx` | Password form: autocomplete hints, autofocus, trimmed username, Caps Lock warning, inline error. |
| `components/AlternativeMethods.jsx` | Google / Face ID / Fingerprint buttons; disabled with a "Soon" tag until enabled. |
| `components/BiometricPanel.jsx` + `PinInput.jsx` | Biometric prompt with automatic PIN fallback. |
| `components/LoginBackground.jsx` + `loginBackground.css` | Animated brand-colored background (pure CSS, honors reduced motion); `light` prop moves the light per showcase slide. Also holds the showcase animations. |
| `components/LoginShowcase.jsx` | Auto-playing slider of the system's areas (7 slides × 4 points): dots with progress, prev/pause/next, arrow keys, swipe. |
| `constants/showcaseSlides.js` | Slide order, icons, background light position, `SHOWCASE_INTERVAL_MS`. Copy lives in `auth.showcase.slides.*`. |
| `hooks/useShowcase.js` | Slider state; pauses on hover/focus/hidden tab; starts paused under reduced motion. Timing is the CSS progress bar's `animationend`. |
| `components/LoginCard.jsx` | The sign-in card (tenant chip, form, alternative methods, biometric panel, Google return). |

The logo lives in `shared/components/brand/BrandLogo.jsx` and is shared with the sidebar.

## Enabling a method

Set `VITE_AUTH_METHODS` (comma list) once the backend endpoint exists:

```
VITE_AUTH_METHODS=password,google,face_id,fingerprint
```

`password` is always on. Unlisted methods render disabled with "Soon".

## Proposed backend contract (not built yet)

All under the tenant API, through `httpClient` (bearer + `api_password` as usual). Every success
returns the same shape as `signin`: `{ token, user }`.

| Method | Endpoint | Body / params | Notes |
|---|---|---|---|
| Google, step 1 | `GET /api/tenant/auth/google/url` | `redirect_uri`, `state` | Returns `{ url }` (Google consent URL). |
| Google, step 2 | `POST /api/tenant/auth/google/callback` | `{ code, redirect_uri }` | Google returns to `/login?code=…&state=…`; the frontend checks `state` before calling. Account must already exist in the tenant (match by email). |
| Biometric, step 1 | `POST /api/tenant/auth/webauthn/options` | `{ login }` | Returns `{ publicKey }` WebAuthn request options, base64url fields (`challenge`, `allowCredentials[].id`). |
| Biometric, step 2 | `POST /api/tenant/auth/webauthn/verify` | `{ login, credential }` | `credential` = serialized assertion (`id`, `rawId`, `type`, `response.{clientDataJSON, authenticatorData, signature, userHandle}`). |
| PIN | `POST /api/tenant/auth/pin/signin` | `{ login, pin }` | 6 digits. Must be rate-limited and lock after repeated failures (answer `423` or `429` with `Retry-After`). |

Face ID and fingerprint are the same WebAuthn call on the web; the OS shows whichever sensor the
device has. Users still need a **registration** flow (enroll the device credential and set a PIN)
inside the app after they are signed in — that belongs with the user profile work, not this page.

Error codes the UI understands: `401/422` wrong credentials, `403` or `code` containing
`inactive|disabled|suspended` disabled account, `404` or `code` containing `tenant` unknown
workspace, `423` locked, `429` (+ `Retry-After`) rate limited, `5xx` server.

## Known gaps

- Token is still persisted in localStorage (`ican-auth`); moving to an httpOnly cookie needs backend work.
- "Forgot password" and "remember me" are not built.
- When the API answers sign-in without `user`, only `{ login }` is stored (unchanged behaviour).
