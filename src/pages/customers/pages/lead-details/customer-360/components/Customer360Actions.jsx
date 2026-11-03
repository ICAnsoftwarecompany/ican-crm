import { Customer360Panel } from './Customer360Panel'

export function Customer360Actions({ children }) {
  return <Customer360Panel title="الإجراءات والتواصل" description="الإجراءات المتاحة وفق صلاحيات المستخدم">{children}</Customer360Panel>
}
