export function SelectedCountBadge({ selectedCount = 0 }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#007A80]">
      المحدد: {selectedCount}
    </div>
  )
}
