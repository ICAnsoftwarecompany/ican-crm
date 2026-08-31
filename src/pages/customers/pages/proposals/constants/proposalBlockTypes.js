import {
  BadgeDollarSign,
  Building2,
  CheckSquare,
  FileText,
  Heading1,
  Image,
  Link2,
  Minus,
  MousePointerClick,
  Package,
  PenLine,
  PlaySquare,
  Rows3,
  Sparkles,
  SquareDashed,
  Text,
  UserRound,
} from 'lucide-react'

export const PROPOSAL_BLOCK_GROUPS = [
  {
    id: 'basic',
    label: 'أساسي',
    blocks: [
      { type: 'cover', label: 'غلاف العرض', icon: Sparkles },
      { type: 'heading', label: 'عنوان', icon: Heading1 },
      { type: 'text', label: 'نص', icon: Text },
      { type: 'image', label: 'صورة', icon: Image },
      { type: 'button', label: 'زر', icon: MousePointerClick },
      { type: 'divider', label: 'فاصل', icon: Minus },
      { type: 'spacer', label: 'مسافة', icon: SquareDashed },
    ],
  },
  {
    id: 'business',
    label: 'بيانات العمل',
    blocks: [
      { type: 'customer_info', label: 'بيانات العميل', icon: UserRound },
      { type: 'company_info', label: 'بيانات الشركة', icon: Building2 },
      { type: 'products', label: 'المنتجات', icon: Package },
      { type: 'pricing', label: 'الأسعار', icon: BadgeDollarSign },
    ],
  },
  {
    id: 'proposal',
    label: 'العرض',
    blocks: [
      { type: 'terms', label: 'الشروط', icon: FileText },
      { type: 'signature', label: 'التوقيع', icon: PenLine },
      { type: 'page_break', label: 'فاصل صفحة', icon: Rows3 },
      { type: 'video', label: 'فيديو', icon: PlaySquare },
      { type: 'custom', label: 'ملاحظة مخصصة', icon: CheckSquare },
      { type: 'link', label: 'رابط', icon: Link2 },
    ],
  },
]

export const BLOCK_LABELS = PROPOSAL_BLOCK_GROUPS
  .flatMap((group) => group.blocks)
  .reduce((acc, block) => ({ ...acc, [block.type]: block.label }), {})
