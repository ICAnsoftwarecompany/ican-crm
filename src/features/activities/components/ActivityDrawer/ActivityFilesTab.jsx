export function ActivityFilesTab({ activity }) {
  const files = activity.files || []

  if (!files.length) {
    return <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm font-semibold text-[var(--text-muted)]">لا توجد ملفات مرفقة.</p>
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <a
          key={file.id || file.path || file.url}
          href={file.url || file.path}
          target="_blank"
          rel="noreferrer"
          className="block rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm font-bold text-[#007A80] hover:bg-[#F8FEFF]"
        >
          {file.name || file.path || file.url}
        </a>
      ))}
    </div>
  )
}
