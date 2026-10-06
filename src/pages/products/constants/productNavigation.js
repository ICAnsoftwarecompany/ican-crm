import { BarChart3, Boxes, BriefcaseBusiness, FolderTree, Layers, Package, Ruler, Tags } from 'lucide-react'

/**
 * Products & Services sub-sidebar. Rebuilt 2026-10-06 for the catalog API: catalog (products, services,
 * instances), organize (categories), setup (item types, units), insights (reports).
 */
export function getProductNavigationGroups(t) {
  return [
    {
      id: 'catalog',
      label: t('catalog.nav.catalog'),
      items: [
        { to: '/products', label: t('catalog.nav.products'), icon: Package, end: true },
        { to: '/products/services', label: t('catalog.nav.services'), icon: BriefcaseBusiness },
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
export function getProductsSidebarConfig(t) {
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
    groups: getProductNavigationGroups(t),
  }
}
