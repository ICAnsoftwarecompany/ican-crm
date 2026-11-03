import { Customer360Panel } from './Customer360Panel'

export function Customer360Profile({ children }) {
  return <Customer360Panel title="الملف الشامل" description="البيانات الأساسية والتفصيلية المسجلة للعميل">{children}</Customer360Panel>
}
