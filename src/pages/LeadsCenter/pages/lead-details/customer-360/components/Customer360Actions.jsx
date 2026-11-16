import { Customer360Panel } from './Customer360Panel'

/** Stack existing action controls vertically without changing their handlers or permissions. */
export function Customer360Actions({ children }) {
  return (
    <Customer360Panel title="مركز الإجراءات" description="تواصل ومتابعة العميل">
      <div className="min-w-0 [&_button]:w-full [&_button]:max-w-full [&_button]:justify-center [&_a]:max-w-full [&_a]:w-full [&_.grid]:grid-cols-1 [&_.flex-wrap]:flex-col [&_.flex-wrap]:items-stretch [&_.flex-wrap]:flex-nowrap [&_.flex]:gap-2">
        {children}
      </div>
    </Customer360Panel>
  )
}
