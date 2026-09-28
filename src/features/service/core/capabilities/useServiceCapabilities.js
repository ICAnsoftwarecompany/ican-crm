import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getServiceCapabilities } from './capabilitiesApi'
import { isFeatureEnabled, normalizeManifest, resolveTerm } from './capabilities.utils'
import { serviceKeys } from '../constants/queryKeys'

/**
 * Capabilities manifest for the current tenant: enabled models, features and
 * terminology. Every Service screen reads what to show from here — never from
 * a hardcoded industry.
 */
export function useServiceCapabilities() {
  const query = useQuery({
    queryKey: serviceKeys.capabilities(),
    queryFn: getServiceCapabilities,
    staleTime: 5 * 60 * 1000,
  })

  const manifest = useMemo(() => normalizeManifest(query.data), [query.data])
  const hasFeature = useCallback((featureKey) => isFeatureEnabled(manifest, featureKey), [manifest])

  return { ...query, manifest, hasFeature }
}

/**
 * Tenant terminology: `term('case')` → "Ticket" / "تذكرة" / tenant label.
 * Use it for every entity name shown in Service screens.
 */
export function useServiceTerminology() {
  const { t, i18n } = useTranslation()
  const { manifest } = useServiceCapabilities()
  const language = i18n.resolvedLanguage || i18n.language || 'ar'

  return useCallback(
    (entity, form = 'one') => resolveTerm({ terminology: manifest.terminology, entity, form, language, t }),
    [manifest.terminology, language, t]
  )
}
