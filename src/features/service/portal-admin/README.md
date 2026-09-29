# features/service/portal-admin — Customer portal administration (F5)

Spec §43–44. The CRM side of the customer portal; the portal itself is a separate app entry (`src/portal`, `features/portal`).
Operations settings → **Customer portal** group, plus a **Portal access** section in the customer drawer Services tab.

| Path | Role |
|---|---|
| `api/portalAdminApi.js` | `GET/POST /portal/accounts`, `PATCH /{id}` (status), `POST /{id}/memberships`, `DELETE /{id}/memberships/{mid}`, `POST /{id}/revoke-sessions|resend-invite`, `GET/PUT /portal/settings`. |
| `components/PortalAccountsPanel.jsx` | Accounts with memberships (customer · type · role · policy), invite, add/remove access, sign out everywhere, disable. Embeddable per customer. |
| `components/PortalAccountDialogs.jsx`, `MembershipFields.jsx` | Invite and add-membership forms. |
| `components/PolicyRulesField.jsx` | Policy rules editor: object → allow / deny per action. Record and entry objects come from the tenant's record types. |
| `components/FormSchemaField.jsx` | Request-form builder for the request catalog (text, long text, number, date, choice; required). |
| `components/PortalSettingsPanel.jsx` | Branding (name, logo, color, welcome), visible sections, OTP channels, B2B password login, subdomain. |
| `constants/portalObjects.js` | Objects, actions, membership types, B2B roles, sections. |

Settings resources: `settings/resources/portalResources.js` — **Portal policies** (`/portal/policies`, a policy in use can't be
deleted → 409) and **Request catalog** (`/service/catalog-items`: case type, form, required documents, optional slot booking,
paid flag, audience by policy).

Rules (server-enforced): one person = one portal account (phone/email unique, 409 `PORTAL_ACCOUNT_EXISTS` → add a membership
instead); access = membership (customer + type + B2B role) + policy; deny wins over allow; portal sessions are separate from
staff sessions. Proposed (confirm with backend): the accounts/memberships and portal settings endpoints.
