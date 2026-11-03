import { Customer360Panel } from './Customer360Panel'

/** Presentation-only slots: the existing CustomerDetailsContent owns queries, actions and dialogs. */
export function Customer360Layout({ header, actions, overview, tabs, content, deals, floatingChats }) {
  return <div dir="rtl" className="min-w-0 space-y-4" data-testid="customer-360-layout">
    <Customer360Panel>{header}</Customer360Panel>
    <Customer360Panel title="الإجراءات والتواصل" description="جميع الإجراءات مرتبطة بسجل العميل الحالي">{actions}</Customer360Panel>
    <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-12">
      <div className="min-w-0 space-y-4 xl:col-span-8">
        <Customer360Panel title="سجل العميل والأنشطة" description="الخط الزمني، المكالمات، الاجتماعات، المهام، الملفات وباقي سجلات العميل">
          <div className="min-w-0">{tabs}</div>
          <div className="mt-4 min-w-0">{content}</div>
        </Customer360Panel>
        {deals && <Customer360Panel title="الصفقات المرتبطة">{deals}</Customer360Panel>}
      </div>
      <aside className="min-w-0 xl:col-span-4">
        <Customer360Panel title="الملف الشامل" description="البيانات الأساسية والتفصيلية المسجلة للعميل">{overview}</Customer360Panel>
      </aside>
    </div>
    {floatingChats}
  </div>
}
