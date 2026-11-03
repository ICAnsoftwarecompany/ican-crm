import { Customer360Panel } from './Customer360Panel'

export function Customer360Activity({ tabs, content }) {
  return <Customer360Panel title="سجل العميل والأنشطة" description="الخط الزمني، المكالمات، الاجتماعات، المهام، الملفات وباقي سجلات العميل">
    <div className="min-w-0">{tabs}</div>
    <div className="mt-4 min-w-0">{content}</div>
  </Customer360Panel>
}
