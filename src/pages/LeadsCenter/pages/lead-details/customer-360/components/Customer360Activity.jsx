import { Customer360Panel } from './Customer360Panel'

export function Customer360Activity({ tabs, content }) {
  return (
    <Customer360Panel title="سجل العميل والأنشطة" description="جميع التفاعلات والمتابعات في مكان واحد">
      <div className="min-w-0">{tabs}</div>
      <div className="mt-3 min-w-0">{content}</div>
    </Customer360Panel>
  )
}
