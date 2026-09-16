import { FormField, inputClassName } from './ActivityFormFields'

export function AssignmentFields({ register }) {
  return (
    <>
      <FormField label="المستخدم المسؤول">
        <input {...register('assigned_to')} className={inputClassName} placeholder="ID المستخدم" />
      </FormField>
      <FormField label="الفريق">
        <input {...register('team_id')} className={inputClassName} placeholder="ID الفريق" />
      </FormField>
    </>
  )
}
