export function SocialChannelBadge({ channel }) {
  const Icon = channel.icon

  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-white"
      style={{ backgroundColor: channel.accent }}
    >
      {Icon ? <Icon size={10} /> : channel.shortLabel || channel.label.slice(0, 2)}
    </span>
  )
}
