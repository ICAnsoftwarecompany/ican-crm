import { Customer360Panel } from './Customer360Panel'

export function Customer360Deals({ children }) {
  if (!children) return null
  return <Customer360Panel title="الصفقات المرتبطة">{children}</Customer360Panel>
}
