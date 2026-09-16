import { FormField, inputClassName } from './ActivityFormFields'

export function MeetingFields({ register, watch, errors }) {
  const mode = watch('mode')

  return (
    <>
      <FormField label="طريقة الاجتماع">
        <select {...register('mode')} className={inputClassName}>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </FormField>
      {mode === 'online' ? (
        <FormField label="رابط الاجتماع" error={errors.meeting_link?.message}>
          <input {...register('meeting_link')} className={inputClassName} placeholder="https://..." />
        </FormField>
      ) : (
        <FormField label="مكان الاجتماع" error={errors.location?.message}>
          <input {...register('location')} className={inputClassName} placeholder="المكان" />
        </FormField>
      )}
    </>
  )
}
