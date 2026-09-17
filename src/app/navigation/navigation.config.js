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
        id: 'campaigns',
        labelKey: 'nav.campaigns',
        icon: Megaphone,
        path: '/campaigns',
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

  // Customer Service is planned architecture only (no routes exist yet), so
  // no section is emitted here. When the module is built, add its section
  // here following the "How to Add a New Module" guide — Sidebar requires no
  // code changes to pick it up.

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
