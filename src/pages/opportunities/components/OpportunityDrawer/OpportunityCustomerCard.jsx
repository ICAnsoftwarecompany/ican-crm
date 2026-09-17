import { useNavigate } from 'react-router-dom'
import { Building2, ExternalLink, Users } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Badge } from '../../../../shared/components/ui/Badge'

export function OpportunityCustomerCard({ opportunity }) {
  const navigate = useNavigate()
  const customer = opportunity.customer || {}
  const products = Array.isArray(customer.current_products) ? customer.current_products : []
  const customerPageId = opportunity.lead_id || customer.id

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-[var(--text-muted)]" />
          <h4 className="font-bold text-[var(--text)]">بيانات العميل</h4>
        </div>

        {customerPageId && (
          <Button size="sm" variant="outline" onClick={() => navigate(`/lead/${customerPageId}`)}>
            <ExternalLink size={14} />
            فتح ملف العميل
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-[var(--text-muted)]">الاسم</p>
          <p className="font-semibold text-[var(--text)]">{customer.name || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">الصناعة</p>
          <p className="font-semibold text-[var(--text)]">{customer.industry || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">عدد الموظفين</p>
          <p className="font-semibold text-[var(--text)] flex items-center gap-1">
            <Users size={13} className="text-[var(--text-muted)]" />
            {customer.employees_count ?? '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">المنتجات الحالية</p>
          {products.length ? (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {products.map((product) => (
                <Badge key={product} variant="info">{product}</Badge>
              ))}
            </div>
          ) : (
            <p className="font-semibold text-[var(--text)]">لا يوجد</p>
          )}
        </div>
      </div>
    </section>
  )
}
