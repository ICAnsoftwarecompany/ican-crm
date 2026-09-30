import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('setup')

/**
 * Industry templates (spec §47.2). `GET /settings/templates` → [{ key, models[], terminology{}, preview{ case_types[],
 * queues[], record_types[], item_types[], sla_policies[] } }] + meta.active.
 * `POST /settings/templates/{key}/apply { models[], terminology{}, dry_run }` — the server seeds configuration
 * idempotently (existing data kept); dry_run returns the same summary without changes.
 */
export const setupApi = {
  templates: async () => (await api.get(serviceEndpoints.setupTemplates)).data,
  apply: async ({ key, ...payload }) => (await api.post(serviceEndpoints.setupApply(key), payload)).data?.data,
}

export const useSetupTemplates = () => useQuery({ queryKey: [...serviceKeys.all, 'setup-templates'], queryFn: setupApi.templates, staleTime: 5 * 60 * 1000 })

export function useApplyTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setupApi.apply,
    onSuccess: (result) => {
      // A real apply changes configuration everywhere: refresh the whole Customer Hub.
      if (!result?.dry_run) queryClient.invalidateQueries({ queryKey: serviceKeys.all })
    },
  })
}

/**
 * Template versioning (F6, spec §47.2). Installation: { template, installed_version, latest_version, upgrade_available,
 * pending, conflicts, versions[{ version, released_at, notes }], history[{ from, to, applied[], skipped[], at, by }] }.
 * Upgrade dry run → changes[{ id, entity, change added|changed|removed, label, field?, from?, to?, note, status
 * pending|conflict|already }]. Apply takes `choices { id: 'take' | 'keep' }`: default takes pending, keeps conflicts.
 */
export const templateVersionApi = {
  installation: async () => (await api.get(serviceEndpoints.templateInstallation)).data?.data,
  preview: async () => (await api.post(`${serviceEndpoints.templateInstallation}/upgrade`, { dry_run: true })).data?.data,
  upgrade: async (choices) => (await api.post(`${serviceEndpoints.templateInstallation}/upgrade`, { choices })).data?.data,
}

export const useTemplateInstallation = () => useQuery({ queryKey: [...serviceKeys.all, 'template-installation'], queryFn: templateVersionApi.installation })

export function useTemplateUpgrade() {
  const queryClient = useQueryClient()
  return {
    preview: useMutation({ mutationFn: templateVersionApi.preview }),
    upgrade: useMutation({ mutationFn: templateVersionApi.upgrade, onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }) }),
  }
}
