import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'

const sections = [
  {
    title: 'كثافة العرض',
    items: ['مريح', 'متوسط', 'مضغوط'],
  },
  {
    title: 'الأعمدة',
    items: ['إظهار وإخفاء الأعمدة', 'إعادة ترتيب الأعمدة من شريط الجدول عند توفرها'],
  },
  {
    title: 'تثبيت الأعمدة',
    items: ['التثبيت يتم من أيقونة القفل داخل رأس العمود', 'إلغاء التثبيت من نفس الأيقونة'],
  },
  {
    title: 'الخط والتنسيق',
    items: ['حجم الخط', 'وزن الخط', 'ألوان الصفوف والخلايا والأعمدة من أدوات الجدول'],
  },
  {
    title: 'الحفظ',
    items: ['إعدادات التنسيق تحفظ عبر قواعد تنسيق الجدول', 'تفضيلات العرض المحلية محفوظة في LocalStorage'],
  },
]

export function TableSettingsDrawer({ open, onClose }) {
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="إعدادات الجدول"
      description="اختصارات لإعدادات العرض الحالية بدون تكرار منطق DataTable."
      size="lg"
      className="w-full sm:w-[30rem]"
    >
      <div className="space-y-3">
        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <h3 className="text-sm font-bold text-[var(--text)]">{section.title}</h3>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--text-muted)]">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AppDrawer>
  )
}
