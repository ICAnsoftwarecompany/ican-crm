import { useTranslation } from 'react-i18next'
import { dealInputClass } from './FieldLabel'

/** Select one person (`[{ id, name }]`). Empty value = "choose…". */
export function PersonSelect({ people = [], value, onChange, placeholder, id, disabled }) {
  const { t } = useTranslation()
  return (
    <select id={id} className={dealInputClass} value={value ?? ''} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder || t('dealWorkspace.common.choose')}</option>
      {people.map((person) => (
        <option key={person.id} value={person.id}>{person.name || `#${person.id}`}</option>
      ))}
    </select>
  )
}
