import { useState } from 'react'
import { DataTable } from '../../shared/components/data-table'
import { Button } from '../../shared/components/ui/Button'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { Plus } from 'lucide-react'

const FIRST_NAMES = [
  'أحمد',
  'محمد',
  'محمود',
  'علي',
  'مصطفى',
  'خالد',
  'عمر',
  'يوسف',
  'سارة',
  'منى',
  'ريم',
  'نور',
  'هدى',
  'ياسمين',
  'فاطمة',
  'مريم',
]

const LAST_NAMES = [
  'حسن',
  'إبراهيم',
  'عبدالله',
  'السيد',
  'النجار',
  'الشافعي',
  'المنصور',
  'العطار',
  'مراد',
  'سالم',
  'فؤاد',
  'جمال',
]

const COMPANIES = [
  'شركة النور للتجارة',
  'دلتا ماركتنج',
  'أفق العقارية',
  'رواد التقنية',
  'المدينة الطبية',
  'سما للخدمات',
  'بيكسل للدعاية',
  'النخبة للاستشارات',
  'كود هاوس',
  'جرين لاين',
  'الشرق للتوزيع',
  'براند ستوديو',
]

const CITIES = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا', 'الزقازيق', 'أسيوط', 'الغردقة']
const SOURCES = ['Facebook Ads', 'WhatsApp', 'Messenger', 'Website', 'Referral', 'Lead Form']
const SALES_REPS = ['أحمد سمير', 'مها خالد', 'كريم عادل', 'دينا فؤاد', 'حسام علي', 'ندى شريف']
const STATUSES = ['نشط', 'معلق', 'مغلق', 'قيد المتابعة']

const makePhone = (index) => {
  const suffix = String(100000000 + index * 7919).slice(0, 9)
  return `+20${suffix}`
}

const SAMPLE_CUSTOMERS = Array.from({ length: 300 }, (_, i) => {
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length]
  const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length]
  const id = i + 1

  return {
    id,
    name: `${firstName} ${lastName}`,
    email: `customer.${id}@ican-demo.com`,
    phone: makePhone(id),
    company: COMPANIES[i % COMPANIES.length],
    city: CITIES[(i * 2) % CITIES.length],
    source: SOURCES[(i * 5) % SOURCES.length],
    assignedTo: SALES_REPS[(i * 7) % SALES_REPS.length],
    type: i % 3 === 0 ? 'lead' : 'customer',
    status: STATUSES[(i * 4 + Math.floor(i / 11)) % STATUSES.length],
    dealValue: 1500 + (i % 35) * 725,
    createdAt: new Date(2026, 6, (i % 22) + 1).toLocaleDateString('ar-EG'),
  }
})

const COLUMNS = [
  {
    id: 'name',
    header: 'الاسم',
    accessor: 'name',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-32',
    enableFilter: false,
  },
  {
    id: 'email',
    header: 'البريد الإلكتروني',
    accessor: 'email',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-40',
    enableFilter: false,
  },
  {
    id: 'phone',
    header: 'الهاتف',
    accessor: 'phone',
    searchable: true,
    sortable: false,
    visible: true,
    width: 'w-32',
    enableFilter: false,
  },
  {
    id: 'company',
    header: 'الشركة',
    accessor: 'company',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-28',
  },
  {
    id: 'city',
    header: 'المدينة',
    accessor: 'city',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-24',
  },
  {
    id: 'source',
    header: 'المصدر',
    accessor: 'source',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-28',
  },
  {
    id: 'assignedTo',
    header: 'المندوب',
    accessor: 'assignedTo',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-28',
  },
  {
    id: 'type',
    header: 'النوع',
    accessor: 'type',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-20',
    render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.type === 'customer' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {row.type === 'customer' ? 'عميل' : 'عميل محتمل'}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'الحالة',
    accessor: 'status',
    searchable: true,
    sortable: true,
    visible: true,
    width: 'w-20',
    render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.status === 'نشط' ? 'bg-blue-100 text-blue-700' :
        row.status === 'معلق' ? 'bg-yellow-100 text-yellow-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {row.status}
      </span>
    ),
  },
  {
    id: 'dealValue',
    header: 'قيمة الصفقة',
    accessor: 'dealValue',
    searchable: false,
    sortable: true,
    visible: true,
    width: 'w-28',
    render: (row) => (
      <span className="font-bold text-blue-700">
        {Number(row.dealValue).toLocaleString('ar-EG')} ج.م
      </span>
    ),
  },
  {
    id: 'createdAt',
    header: 'تاريخ الإنشاء',
    accessor: 'createdAt',
    searchable: false,
    sortable: true,
    visible: true,
    width: 'w-24',
  },
]

export function DataTableDemo() {
  const [data] = useState(SAMPLE_CUSTOMERS)
  const [isLoading] = useState(false)

  return (
    <div>
      <PageToolbar title="عرض توضيحي - جدول البيانات" description="اختبر مكون DataTable مع 300 عميل، الفرز، البحث، التصفيح، الفلاتر، والأعمدة">
        <Button variant="primary" className="gap-2">
          <Plus size={16} />
          إضافة عميل
        </Button>
      </PageToolbar>

      <section>
        <DataTable
          data={data}
          columns={COLUMNS}
          tableId="customers-demo"
          isLoading={isLoading}
          emptyMessage="لا توجد عملاء"
          enableSorting={true}
          enableFiltering={true}
          enableGlobalSearch={true}
          enablePagination={true}
          enableColumnVisibility={true}
          showToolbar={true}
          showFooter={true}
        />
      </section>
    </div>
  )
}
