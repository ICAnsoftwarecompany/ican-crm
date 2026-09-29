import { useQueries } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { serviceKeys } from '../../core/constants/queryKeys'
import { useCaseSetup } from '../../cases/hooks/useCases'
import { createResourceApi } from '../api/settingsApi'
import { getSettingsResource } from '../resources'

/**
 * Everything a settings form needs for its options: the resource's own list,
 * the lists it depends on (e.g. SLA policies need business calendars) and
 * the case setup (agents, statuses, priorities).
 */
export function useSettingsContext(resource) {
  const { t, i18n } = useTranslation()
  const setup = useCaseSetup()
  const keys = [resource.key, ...(resource.dependsOn || [])]
  const results = useQueries({
    queries: keys.map((key) => {
      const definition = getSettingsResource(key)
      return {
        queryKey: serviceKeys.settings(key),
        queryFn: () => createResourceApi(definition.endpoint).list(),
        staleTime: 60 * 1000,
      }
    }),
  })
  const lists = Object.fromEntries(keys.map((key, index) => [key, results[index]]))
  return { t, language: i18n.language, lists, setup: setup.data }
}
