import { Activity, Loader2, Wifi, WifiOff } from 'lucide-react'
import { useNetworkQuality } from '../../hooks/useNetworkQuality'

const QUALITY_META = {
  strong: {
    color: 'text-emerald-600',
    dot: 'bg-emerald-500',
    label: 'الشبكة قوية',
    bars: 4,
  },
  medium: {
    color: 'text-amber-600',
    dot: 'bg-amber-500',
    label: 'الشبكة متوسطة',
    bars: 3,
  },
  weak: {
    color: 'text-red-600',
    dot: 'bg-red-500',
    label: 'الشبكة ضعيفة',
    bars: 1,
  },
  offline: {
    color: 'text-slate-400',
    dot: 'bg-slate-400',
    label: 'غير متصل بالإنترنت',
    bars: 0,
  },
  unknown: {
    color: 'text-slate-500',
    dot: 'bg-slate-400',
    label: 'حالة الشبكة غير مؤكدة',
    bars: 2,
  },
}

function getNetworkDetails({ connection, latency }) {
  const details = []

  if (connection?.effectiveType) details.push(connection.effectiveType)
  if (Number(connection?.downlink)) details.push(`${connection.downlink} Mbps`)
  if (Number(connection?.rtt)) details.push(`${connection.rtt}ms RTT`)
  if (latency !== null) details.push(`${latency}ms ping`)

  return details.join(' - ')
}

function SignalBars({ activeBars }) {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={`w-1 rounded-sm ${bar <= activeBars ? 'bg-current' : 'bg-[#D1D5DB]'}`}
          style={{ height: `${bar * 3 + 3}px` }}
        />
      ))}
    </span>
  )
}

export function NetworkStatusIndicator() {
  const network = useNetworkQuality()
  const meta = QUALITY_META[network.quality] || QUALITY_META.unknown
  const details = getNetworkDetails(network)
  const Icon = network.online ? Wifi : WifiOff
  const title = details ? `${meta.label} - ${details}` : meta.label

  return (
    <div
      className={`h-8 min-w-8 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2 ${meta.color}`}
      title={network.checking ? 'جاري فحص الشبكة' : title}
      aria-label={network.checking ? 'جاري فحص الشبكة' : title}
      role="status"
    >
      {network.checking ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Icon size={15} />
      )}
      <SignalBars activeBars={meta.bars} />
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      <Activity size={13} className="hidden xl:block opacity-70" />
    </div>
  )
}
