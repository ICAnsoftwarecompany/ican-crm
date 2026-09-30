# shared/components/sub-sidebar — the one sub-sidebar

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — folder created.

**Status:** CURRENT · **Public API:** `index.js` (import only from there) · **Tests:** `subSidebarUtils.test.js`

Every internal ("sub") sidebar in the app — the second navigation column inside an area such as the Leads Center,
Settings or the Communication hub — is built from this folder. **Do not write a new `*Sidebar.jsx` with its own
`NavLink` styling, collapse button or mobile drawer.** This is a project rule (see `CLAUDE.md` rule 10 and
[docs/1-ARCHITECTURE.md → Sub-sidebar](../../../../docs/1-ARCHITECTURE.md#sub-sidebar)).

## Pieces

| Export | Use it for |
|---|---|
| `SubSidebarLayout` | **Default.** A whole area layout: attached sidebar (desktop) + menu button and drawer (mobile) + `<Outlet />`. Collapse state persisted per `storageKey`. |
| `SubSidebar` | The config-driven sidebar itself (header + groups + pinned footer). Use directly when the page owns its own grid (Outreach, Social Media). |
| `SubSidebarFrame`, `SubSidebarHeader`, `SubSidebarNav`, `SubSidebarGroup`, `SubSidebarFooter`, `SubSidebarNavItem` | Building blocks for a sidebar that needs one custom part (Campaign Center's expandable platform rows, Customer Hub settings nav). |
| `SubSidebarMobileDrawer` | The mobile slide-in drawer (used by `SubSidebarLayout`). |
| `getVisibleSubSidebarGroups`, `flattenSubSidebarItems`, `getSubSidebarItemKey` | Pure helpers (hidden items/empty groups removal). |

`SubSidebarFrame` variants: `attached` (glued to the page edge, sticky, desktop only), `framed` (rounded card in a grid
column), `plain` (inside the mobile drawer).

## Config shape

```js
{
  header: { icon, title, description?, expandLabel?, collapseLabel? },   // all strings already translated
  ariaLabel?: string,
  width?: number,                                                        // attached width, default 260
  groups: [
    { id, label?, note?, divider?, items: [
      { id?, to, label, icon, end?, disabled?, badge?, trailing?, hidden? },
    ] },
  ],
  footerItems?: [/* same item shape — e.g. the area's Settings link */],
}
```

- Labels are passed **translated** (`t('...')`) — the component never guesses i18n keys.
- `hidden: true` drops an item (plan/permission gating decided by the caller). `disabled: true` shows it greyed out
  (e.g. "coming soon"). Remember: hiding a link is UX only, never authorization.
- Keep the area's config in one function next to the area, e.g. `getCustomersSidebarConfig(t)`
  (`pages/customers/constants/customerNavigation.js`) or `getCommunicationSidebarConfig(moduleId, t)`
  (`features/communication/navigation/`).

## Adding a sub-sidebar to a new area

```jsx
export function ReportsLayout() {
  const { t } = useTranslation()
  return (
    <SubSidebarLayout
      storageKey="reports-sidebar-collapsed"
      mobileId="reports-mobile-sidebar"
      mobileLabel={t('reports.nav.menu')}
      sidebar={getReportsSidebarConfig(t)}
    />
  )
}
```

Then use the layout as the `element` of a parent route whose children are the area's pages.

## Current consumers (2026-10-01)

Leads Center (`pages/customers/layout/CustomersLayout.jsx`), Products (`pages/products/layout/ProductsLayout.jsx`),
Settings (`pages/settings/layout/SettingsLayout.jsx`), Communication hub (`features/communication/components/CommunicationModuleLayout.jsx`),
Outreach (`features/outreach-campaigns/components/OutreachSidebar.jsx`), Social Media
(`pages/social-media/components/SocialMediaSubSidebar.jsx`), Campaign Center (`pages/campaigns/components/CampaignSubSidebar.jsx`),
Customer Hub settings (`features/service/settings/components/SettingsWorkspace.jsx`).

Replaced and deleted: `CustomersSidebar.jsx`, `CustomersMobileSidebar.jsx`, `ProductsSidebar.jsx`,
`ProductsMobileSidebar.jsx`, `SettingsSidebar.jsx`, `SettingsMobileSidebar.jsx`,
`shared/components/layout/WorkspaceSubSidebarFrame.jsx`. localStorage collapse keys were kept
(`customers-sidebar-collapsed`, `products-sidebar-collapsed`, `settings-sidebar-collapsed`, …).

Not sub-sidebars (left as they are): Tasks workspace filter panel (views/boards, not routes), horizontal tab navs
(`ServicesHubNav`, `BillingNav`), the customer portal app shell.
