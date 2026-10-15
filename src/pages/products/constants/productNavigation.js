import { BarChart3, Boxes, CircleDot, LayoutDashboard, Layers3, Repeat, BriefcaseBusiness, FolderTree, Layers, Package, Ruler, Tags } from 'lucide-react'

/**
 * Products & Services sub-sidebar. Rebuilt 2026-10-06 for the catalog API: catalog (overview — first, 2026-10-15 —
 * products, services, instances), organize (categories), setup (item types, units), insights (reports).
 */
/** Active item types → sub-pages `/products/types/:id` (product types under Products; the rest under Services). */
function typeItems(itemTypes = [], kinds) {
  return itemTypes
    .filter((itemType) => itemType.status && kinds.includes(itemType.kind))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))
    .map((itemType) => ({ id: `type-${itemType.id}`, to: `/products/types/${itemType.id}`, label: itemType.name, icon: CircleDot }))
}

/**
 * 2026-10-15: Products and Services have sub-pages — one per active item type (named after it), and under Services
 * the plans and bundles pages. `itemTypes` = normalized item types (the sidebar updates when one is added).
 */
export function getProductNavigationGroups(t, { itemTypes = [] } = {}) {
  return [
    {
      id: 'catalog',
      label: t('catalog.nav.catalog'),
      items: [
        { to: '/products/overview', label: t('catalog.nav.overview'), icon: LayoutDashboard },
        { to: '/products', label: t('catalog.nav.products'), icon: Package, end: true, children: typeItems(itemTypes, ['product']) },
        {
          to: '/products/services',
          label: t('catalog.nav.services'),
          icon: BriefcaseBusiness,
          end: true,
          children: [
            { to: '/products/services/plans', label: t('catalog.nav.plans'), icon: Repeat },
            { to: '/products/services/bundles', label: t('catalog.nav.bundles'), icon: Layers3 },
            ...typeItems(itemTypes, ['service', 'plan', 'bundle']),
          ],
        },
        { to: '/products/instances', label: t('catalog.nav.instances'), icon: Boxes },
      ],
    },
    {
      id: 'organize',
      label: t('catalog.nav.organize'),
      items: [
        { to: '/products/categories', label: t('products.nav.productCategories'), icon: Tags },
        { to: '/products/service-categories', label: t('products.serviceCategories.pageTitle'), icon: FolderTree },
      ],
    },
    {
      id: 'setup',
      label: t('catalog.nav.setup'),
      items: [
        { to: '/products/item-types', label: t('catalog.nav.itemTypes'), icon: Layers },
        { to: '/products/units', label: t('catalog.nav.units'), icon: Ruler },
      ],
    },
    {
      id: 'insights',
      label: t('products.nav.insights'),
      items: [
        { to: '/products/reports', label: t('products.nav.reports'), icon: BarChart3 },
      ],
    },
  ]
}

/** Everything <SubSidebarLayout sidebar={...}> needs for Products & Services. */
export function getProductsSidebarConfig(t, { itemTypes = [] } = {}) {
  return {
    header: {
      icon: Package,
      title: t('products.sidebar.title'),
      description: t('products.sidebar.subtitle'),
      expandLabel: t('products.sidebar.openMenu'),
      collapseLabel: t('products.sidebar.closeMenu'),
    },
    ariaLabel: t('products.sidebar.ariaLabel'),
    width: 240,
    groups: getProductNavigationGroups(t, { itemTypes }),
  }
}
