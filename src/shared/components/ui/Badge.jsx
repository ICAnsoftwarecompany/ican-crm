import { cn } from '../../utils/cn'

const variants = {
  default:  'bg-[#F0F4FC] text-[#162847]',
  success:  'bg-[#ECFDF5] text-[#065F46]',
  warning:  'bg-[#FFFBEB] text-[#92400E]',
  danger:   'bg-[#FEF2F2] text-[#991B1B]',
  info:     'bg-[#EFF6FF] text-[#1D4ED8]',
  purple:   'bg-[#F5F3FF] text-[#5B21B6]',
  ai:       'bg-[#E8F9FA] text-[#007A80] border border-[#A0ECF0]',
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-arabic',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
