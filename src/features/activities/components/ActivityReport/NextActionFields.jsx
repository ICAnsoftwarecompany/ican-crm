import { ACTIVITY_NEXT_ACTIONS, getNextActionConfig } from '../../utils/activityNextActions'

export function NextActionFields({ register, watch, errors, inputClassName }) {
  const nextAction = watch('next_action')
  const config = getNextActionConfig(nextAction)

  return (
    <>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>الإجراء التالي</span>
        <select {...register('next_action')} className={inputClassName}>
          {ACTIVITY_NEXT_ACTIONS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        {errors.next_action ? <span className="block text-[11px] text-red-600">{errors.next_action.message}</span> : null}
      </label>
      {config.requiresDate ? (
        <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
          <span>موعد الإجراء التالي</span>
          <input {...register('next_action_at')} type="datetime-local" className={inputClassName} />
          {errors.next_action_at ? <span className="block text-[11px] text-red-600">{errors.next_action_at.message}</span> : null}
        </label>
      ) : null}
    </>
  )
}
