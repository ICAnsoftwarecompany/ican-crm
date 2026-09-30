import { BriefcaseBusiness, FolderTree, Package, Tags } from 'lucide-react'

export function getProductNavigationGroups(t) {
  return [
    {
      id: 'products',
      label: t('products.list.pageTitle'),
      items: [
        { to: '/products', label: t('products.list.pageTitle'), icon: Package, end: true },
        { to: '/products/categories', label: t('products.nav.productCategories'), icon: Tags },
      ],
    },
    {
      id: 'services',
      label: t('products.services.pageTitle'),
      items: [
        { to: '/products/services', label: t('products.services.pageTitle'), icon: BriefcaseBusiness },
        { to: '/products/service-categories', label: t('products.serviceCategories.pageTitle'), icon: FolderTree },
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
