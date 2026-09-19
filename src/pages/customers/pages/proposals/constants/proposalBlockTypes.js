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

const PROPOSAL_BLOCK_GROUP_DEFINITIONS = [
  {
    id: 'basic',
    groupKey: 'basic',
    blocks: [
      { type: 'cover', icon: Sparkles },
      { type: 'heading', icon: Heading1 },
      { type: 'text', icon: Text },
      { type: 'image', icon: Image },
      { type: 'button', icon: MousePointerClick },
      { type: 'divider', icon: Minus },
      { type: 'spacer', icon: SquareDashed },
    ],
  },
  {
    id: 'business',
    groupKey: 'business',
    blocks: [
      { type: 'customer_info', icon: UserRound },
      { type: 'company_info', icon: Building2 },
      { type: 'products', icon: Package },
      { type: 'pricing', icon: BadgeDollarSign },
    ],
  },
  {
    id: 'proposal',
    groupKey: 'proposal',
    blocks: [
      { type: 'terms', icon: FileText },
      { type: 'signature', icon: PenLine },
      { type: 'page_break', icon: Rows3 },
      { type: 'video', icon: PlaySquare },
      { type: 'custom', icon: CheckSquare },
      { type: 'link', icon: Link2 },
    ],
  },
]

export function getBlockLabel(type, t) {
  return t ? t(`proposals.builder.blockTypes.${type}`) : type
}

export function getProposalBlockGroups(t) {
  return PROPOSAL_BLOCK_GROUP_DEFINITIONS.map((group) => ({
    id: group.id,
    label: t ? t(`proposals.builder.groups.${group.groupKey}`) : group.groupKey,
    blocks: group.blocks.map((block) => ({
      type: block.type,
      icon: block.icon,
      label: getBlockLabel(block.type, t),
    })),
  }))
}
