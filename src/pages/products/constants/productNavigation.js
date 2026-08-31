import { BriefcaseBusiness, FolderTree, Package, Tags } from 'lucide-react'

export const productNavigationGroups = [
  {
    id: 'products',
    label: 'المنتجات',
    items: [
      { to: '/products', label: 'المنتجات', icon: Package, end: true },
      { to: '/products/categories', label: 'تصنيفات المنتجات', icon: Tags },
    ],
  },
  {
    id: 'services',
    label: 'الخدمات',
    items: [
      { to: '/products/services', label: 'الخدمات', icon: BriefcaseBusiness },
      { to: '/products/service-categories', label: 'تصنيفات الخدمات', icon: FolderTree },
    ],
  },
]
