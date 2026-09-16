import { FormField, inputClassName } from './ActivityFormFields'

export function ReminderFields({ register }) {
  return (
    <div className="grid gap-3 rounded-lg border border-[#E5F7F8] bg-[#F8FEFF] p-3 sm:grid-cols-2">
      <FormField label="التذكير قبل">
        <input {...register('reminder_before')} type="number" min="0" className={inputClassName} />
      </FormField>
      <FormField label="وحدة التذكير">
        <select {...register('reminder_unit')} className={inputClassName}>
          <option value="minutes">دقائق</option>
          <option value="hours">ساعات</option>
          <option value="days">أيام</option>
        </select>
      </FormField>
    </div>
  )
}
