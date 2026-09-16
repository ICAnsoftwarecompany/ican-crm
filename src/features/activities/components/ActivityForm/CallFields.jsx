import { FormField, inputClassName } from './ActivityFormFields'

export function CallFields({ register }) {
  return (
    <>
      <FormField label="رقم الهاتف">
        <input {...register('phone')} className={inputClassName} placeholder="رقم العميل أو رقم الاتصال" />
      </FormField>
      <FormField label="مزود المكالمة">
        <select {...register('call_provider')} className={inputClassName}>
          <option value="manual">Manual</option>
          <option value="cloud_call_center">Cloud Call Center</option>
        </select>
      </FormField>
    </>
  )
}
