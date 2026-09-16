import { FormField, inputClassName } from './ActivityFormFields'

export function RelatedEntityFields({ register, errors }) {
  return (
    <>
      <FormField label="نوع الربط" error={errors.related_type?.message}>
        <select {...register('related_type')} className={inputClassName}>
          <option value="lead">Lead</option>
          <option value="customer">Customer</option>
        </select>
      </FormField>
      <FormField label="رقم العميل / الليد" error={errors.taskable_id?.message}>
        <input {...register('taskable_id')} className={inputClassName} placeholder="مثال: 53" />
      </FormField>
    </>
  )
}
