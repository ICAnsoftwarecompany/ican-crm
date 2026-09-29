/**
 * Single source of truth for ICAN CRM's primary (sidebar) navigation.
 *
 * Sidebar.jsx and Header.jsx both render FROM this file (via useNavigation())
 * instead of Header depending on Sidebar's internals. Adding a normal
 * destination should only ever require adding one entry here — see
 * src/shared/components/layout/SIDEBAR_ARCHITECTURE.md for the full guide.
 *
 * @typedef {Object} NavigationBadge
 * @property {'count'} type
 * @property {string} source - Identifier a future workspace-summary hook can resolve. Not wired to any API yet.
 *
 * @typedef {Object} NavigationItem
 * @property {string} id - Unique, stable id (used for React keys and expand/collapse state).
 * @property {string} labelKey - i18next key resolved by the renderer, e.g. 'nav.leads'.
 * @property {React.ComponentType} icon - lucide-react icon component.
 * @property {string} path - Existing app route. Never invent a path that has no route.
 * @property {boolean} [end] - Passed to <NavLink end>; also used as the default exact-match rule when activePatterns is omitted.
 * @property {string[]} [activePatterns] - Patterns deciding when this item is "active". A pattern ending in "/*" matches that prefix and anything nested under it; anything else must match exactly. Defaults to [path] (or [path, `${path}/*`] when `end` is false).
 * @property {string} [module] - Tenant module id gating this item. `undefined` = always available (core). See navigation.utils#isModuleEnabled.
 * @property {string} [permission] - Permission key gating this item. `undefined` = always visible. See navigation.utils#hasNavigationPermission.
 * @property {string} [featureFlag] - Feature flag key gating this item. No flag system exists yet; reserved for future use.
 * @property {NavigationBadge} [badge] - Reserved schema for a future count badge (e.g. open tickets). Not implemented — do not fabricate counts.
 *
 * @typedef {Object} NavigationSection
 * @property {string} id - Unique, stable id.
 * @property {'section'} type
 * @property {string} labelKey - i18next key for the section heading, e.g. 'nav.sections.sales'.
 * @property {boolean} [hideLabel] - Render items without a group heading (used for the single-item Overview section).
 * @property {string} [module] - Tenant module id gating the whole section.
 * @property {NavigationItem[]} items
 */

import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarClock,
  CalendarDays,
  FileSignature,
  Megaphone,
  Send,
  Target,
  MessageSquare,
  CheckSquare,
  MessagesSquare,
  Package,
  UsersRound,
  UserCog,
  LayoutTemplate,
  Settings,
  Workflow,
  Share2,
  Handshake,
  Headset,
  Inbox,
  ListChecks,
  Settings2,
} from 'lucide-react'

/** @type {NavigationSection[]} */
export const navigationConfig = [
  {
    id: 'overview',
    type: 'section',
    labelKey: 'nav.sections.overview',
    hideLabel: true,
    items: [
      {
        id: 'dashboard',
        labelKey: 'nav.dashboard',
        icon: LayoutDashboard,
        path: '/',
        end: true,
      },
    ],
  },

  // Sales: active sales execution against Leads and Customers, the work
  // items that come out of it (Activities, Proposals). "Opportunities" as a
  // qualified-pipeline entity is planned but not implemented — see
  // SIDEBAR_ARCHITECTURE.md ("Current vs Future"). Do not confuse it with
  // Growth's Opportunity Center below.
  {
    id: 'sales',
    type: 'section',
    labelKey: 'nav.sections.sales',
    module: 'sales',
    items: [
      {
        id: 'leads',
        labelKey: 'nav.leads',
        icon: Users,
        path: '/leads',
        end: true,
      },
      {
        id: 'customers',
        labelKey: 'nav.customers',
        icon: UserCheck,
        path: '/LeadsCenter',
        activePatterns: ['/LeadsCenter', '/LeadsCenter/*', '/lead/*', '/leads/*'],
        permission: 'customers.view',
      },
      {
        id: 'activities',
        labelKey: 'nav.activities',
        icon: CalendarClock,
        path: '/activities',
        activePatterns: ['/activities', '/activities/*'],
      },
      {
        id: 'deals',
        labelKey: 'nav.deals',
        icon: Handshake,
        path: '/deals',
        activePatterns: ['/deals', '/deals/*'],
      },
      {
        id: 'proposals',
        labelKey: 'nav.proposals',
        icon: FileSignature,
        path: '/LeadsCenter/proposals',
        activePatterns: ['/LeadsCenter/proposals', '/LeadsCenter/proposals/*'],
      },
    ],
  },

  // Growth: demand generation and opportunity discovery. "Campaigns" here is
  // the pre-existing Meta/Facebook Ads feature (features/campaigns +
  // pages/campaigns/CampaignsPage.jsx) — unrelated to Outreach Campaigns
  // below despite the shared word. See "Outreach Campaigns vs Campaigns" in
  // OUTREACH_CAMPAIGNS_ARCHITECTURE_AR.md before touching either.
  {
    id: 'growth',
    type: 'section',
    labelKey: 'nav.sections.growth',
    module: 'growth',
    items: [
      {
        id: 'social-media',
        labelKey: 'nav.socialMedia',
        icon: Share2,
        path: '/social-media',
        permission: 'social.view',
        activePatterns: ['/social-media', '/social-media/*'],
      },
      {
        id: 'campaigns',
        labelKey: 'nav.campaigns',
        icon: Megaphone,
        path: '/campaigns',
        activePatterns: ['/campaigns', '/campaigns/*'],
      },
      {
        id: 'outreach-campaigns',
        labelKey: 'nav.outreachCampaigns',
        icon: Send,
        path: '/outreach-campaigns',
        activePatterns: ['/outreach-campaigns', '/outreach-campaigns/*'],
        permission: 'outreachCampaigns.view',
      },
      {
        id: 'opportunity-center',
        labelKey: 'nav.opportunityCenter',
        icon: Target,
        path: '/opportunities',
      },
    ],
  },

  // Customer Hub (Service Operations after the sale) — features/service, built in
  // phases F0–F7 (docs/4-CUSTOMER-SERVICE.md). Keep 3–7 items here; deeper
  // destinations (settings, records, reports) live inside /service pages.
  {
    id: 'customer-service',
    type: 'section',
    labelKey: 'nav.sections.customerHub',
    module: 'customer_service',
    items: [
      {
        id: 'service-center',
        labelKey: 'nav.serviceCenter',
        icon: Headset,
        path: '/service',
        end: true,
        activePatterns: ['/service', '/service/overview'],
      },
      {
        id: 'service-cases',
        labelKey: 'nav.serviceCases',
        icon: Inbox,
        path: '/service/cases',
        activePatterns: ['/service/cases', '/service/cases/*'],
      },
      {
        id: 'service-my-work',
        labelKey: 'nav.serviceMyWork',
        icon: ListChecks,
        path: '/service/my-work',
      },
      {
        id: 'service-settings',
        labelKey: 'nav.serviceSettings',
        icon: Settings2,
        path: '/service/settings',
        activePatterns: ['/service/settings', '/service/settings/*'],
      },
    ],
  },

  // Workspace: cross-module, company-wide tools. Conversations lives here
  // short-term per the migration strategy documented in
  // SIDEBAR_ARCHITECTURE.md; it may become Customer Service > Service Inbox
  // once that module exists.
  {
    id: 'workspace',
    type: 'section',
    labelKey: 'nav.sections.workspace',
    items: [
      {
        id: 'conversations',
        labelKey: 'nav.conversations',
        icon: MessageSquare,
        path: '/conversations',
      },
      {
        id: 'tasks',
        labelKey: 'nav.tasks',
        icon: CheckSquare,
        path: '/tasks',
      },
      {
        id: 'calendar',
        labelKey: 'nav.calendar',
        icon: CalendarDays,
        path: '/calendar',
      },
      {
        id: 'team-chat',
        labelKey: 'nav.teamChat',
        icon: MessagesSquare,
        path: '/team-chat',
      },
      {
        id: 'products',
        labelKey: 'nav.products',
        icon: Package,
        path: '/products',
        activePatterns: ['/products', '/products/*'],
      },
    ],
  },

  // Insights (Reports/Analytics) is planned architecture only — no section
  // emitted until real pages exist.

  // Automation: the central, module-agnostic Workflow Engine's own
  // workspace (workflow list, templates, executions/logs). This is
  // reserved as `module: 'automation'` in the Future Modules table below —
  // now implemented. Individual modules also embed the same builder
  // in-context (e.g. Outreach Campaigns' Sequence/Automation tab) rather
  // than duplicating it; this section is only the cross-module home.
  {
    id: 'automation',
    type: 'section',
    labelKey: 'nav.sections.automation',
    hideLabel: true,
    module: 'automation',
    items: [
      {
        id: 'automation-center',
        labelKey: 'nav.automation',
        icon: Workflow,
        path: '/automation',
      },
    ],
  },

  // Administration: operational-but-not-daily-work destinations, kept below
  // Sales/Growth/Workspace per "operational items first". Integrations is
  // intentionally NOT a top-level item — it already lives inside Settings'
  // own internal tabs (see settings navigation), matching the "Settings
  // Strategy" rule of not polluting the global sidebar.
  {
    id: 'administration',
    type: 'section',
    labelKey: 'nav.sections.administration',
    items: [
      {
        id: 'teams',
        labelKey: 'nav.teams',
        icon: UsersRound,
        path: '/teams',
      },
      {
        id: 'users',
        labelKey: 'nav.users',
        icon: UserCog,
        path: '/users',
      },
      {
        id: 'templates',
        labelKey: 'nav.templates',
        icon: LayoutTemplate,
        path: '/templates',
      },
      {
        id: 'settings',
        labelKey: 'nav.settings',
        icon: Settings,
        path: '/settings',
        activePatterns: ['/settings', '/settings/*'],
      },
    ],
  },
]
