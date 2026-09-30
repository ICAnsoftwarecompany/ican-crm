import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('imports')
const unwrap = (response) => response.data?.data ?? response.data
const I = serviceEndpoints.imports

/**
 * Import engine (spec §15.1): upload CSV → map columns → dry run (nothing saved) → execute (async on the server) →
 * error file to fix and re-upload. Job: { id, entity_type, scope_id, file_name, mode (create|upsert), match_key, status
 * (validated|completed|completed_with_errors), total, valid, failed, to_create, to_update, succeeded, errors_preview[] }.
 */
export const importsApi = {
  entities: async () => unwrap(await api.get(`${I}/entities`)) || [],
  fields: async (params) => unwrap(await api.get(`${I}/fields`, { params })) || [],
  mappings: async (params) => unwrap(await api.get(`${I}/mappings`, { params })) || [],
  upload: async ({ fileName, content }) => unwrap(await api.post(`${I}/files`, { file_name: fileName, content })),
  dryRun: async (payload) => unwrap(await api.post(I, payload)),
  execute: async (id) => unwrap(await api.post(`${I}/${id}/execute`)),
  jobs: async () => unwrap(await api.get(I, { params: { per_page: 50 } })) || [],
  errorFile: async (id) => unwrap(await api.get(`${I}/${id}/error-file`)),
}

export const useImportEntities = () => useQuery({ queryKey: [...serviceKeys.imports(), 'entities'], queryFn: importsApi.entities, staleTime: 5 * 60 * 1000 })
export const useImportFields = (params) => useQuery({ queryKey: serviceKeys.importFields(params), queryFn: () => importsApi.fields(params), enabled: Boolean(params?.entity_type) })
export const useImportMappings = (params) => useQuery({ queryKey: [...serviceKeys.imports(), 'mappings', params ?? {}], queryFn: () => importsApi.mappings(params), enabled: Boolean(params?.entity_type) })
export const useImportJobs = () => useQuery({ queryKey: [...serviceKeys.imports(), 'jobs'], queryFn: importsApi.jobs })

export function useImportMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: serviceKeys.imports() })
    ;[serviceKeys.records(), serviceKeys.assets()].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
  }
  return {
    upload: useMutation({ mutationFn: importsApi.upload, onError }),
    dryRun: useMutation({ mutationFn: importsApi.dryRun, onSuccess: refresh, onError }),
    execute: useMutation({ mutationFn: importsApi.execute, onSuccess: refresh, onError }),
  }
}

/** Downloads the server's error file (only failed rows + an "errors" column). */
export async function downloadErrorFile(jobId) {
  const file = await importsApi.errorFile(jobId)
  const blob = new Blob(['﻿', file.content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: file.file_name })
  link.click()
  URL.revokeObjectURL(url)
}
