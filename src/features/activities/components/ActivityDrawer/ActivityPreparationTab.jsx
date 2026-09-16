function InfoLine({ label, value }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 border-b border-[var(--border)] py-2 last:border-0">
      <span className="shrink-0 text-xs font-black text-[var(--text-muted)]">{label}</span>
      <span className="min-w-0 whitespace-normal break-words text-end text-sm font-bold text-[var(--text)]">{value || '-'}</span>
    </div>
  )
}

export function ActivityPreparationTab({ activity }) {
  const related = activity.relatedEntity || {}

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <h4 className="mb-2 text-sm font-black text-[var(--text)]">بيانات العميل قبل التواصل</h4>
        <InfoLine label="الاسم" value={related.name} />
        <InfoLine label="الشركة" value={related.company} />
        <InfoLine label="الحالة" value={related.status} />
        <InfoLine label="المصدر" value={related.source} />
        <InfoLine label="الهاتف" value={related.phone || activity.phone} />
        <InfoLine label="البريد" value={related.email} />
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <h4 className="mb-2 text-sm font-black text-[var(--text)]">ملاحظات التحضير</h4>
        <p className="whitespace-normal break-words text-sm font-semibold text-[var(--text-muted)]">
          يتم تجميع هذه البيانات من علاقة النشاط بالـ Lead/Customer. يمكن توسيع هذا التاب لاحقا لعرض آخر مهمة، آخر proposal، وآخر محادثة عند توفرها من الـ API.
        </p>
      </section>
    </div>
  )
}
