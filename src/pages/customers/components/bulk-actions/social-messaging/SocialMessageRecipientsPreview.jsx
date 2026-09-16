export function SocialMessageRecipientsPreview({ recipients = [] }) {
  const recipientsPreview = recipients.slice(0, 4)
  const extraRecipientsCount = Math.max(0, recipients.length - recipientsPreview.length)

  return (
    <div className="rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-3">
      <div className="text-xs font-black text-[var(--text)]">
        العملاء المحددون ({recipients.length})
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {recipientsPreview.map((recipient) => (
          <span
            key={`${recipient.lead_id}-${recipient.id || 'x'}`}
            className="inline-flex items-center rounded-full border border-[#CDEEEF] bg-white px-2 py-1 text-[11px] font-bold text-[var(--text)]"
          >
            {recipient.name}
          </span>
        ))}
        {extraRecipientsCount > 0 && (
          <span className="inline-flex items-center rounded-full border border-[#CDEEEF] bg-white px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
            +{extraRecipientsCount}
          </span>
        )}
      </div>
    </div>
  )
}
