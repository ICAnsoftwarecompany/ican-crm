import { Customer360Panel } from './Customer360Panel'

export function Customer360Actions({ children }) {
  return (
    <Customer360Panel title="مركز الإجراءات" description="تواصل ومتابعة العميل">
      <div className="min-w-0 [&_button]:max-w-full">{children}</div>
    </Customer360Panel>
  )
}
