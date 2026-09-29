import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('knowledge')
const unwrap = (response) => response.data?.data ?? response.data

/**
 * Knowledge base API (spec §41). Article: { id, category_id, category: {id,label}|null,
 * title, body, language, visibility: internal|agent|customer|public,
 * status: draft|published|archived, tags[], related_case_type_ids[], version,
 * published_at, expires_at?, updated_at }. New articles are drafts; publishing
 * is a separate call (kb.publish permission on the server).
 */
export const knowledgeApi = {
  /** @param {{ search?: string, category_id?: string, status?: string, visibility?: string }} params */
  list: async (params) => unwrap(await api.get(serviceEndpoints.kbArticles, { params })) || [],
  get: async (articleId) => unwrap(await api.get(serviceEndpoints.kbArticle(articleId))),
  create: async (payload) => unwrap(await api.post(serviceEndpoints.kbArticles, payload)),
  update: async (articleId, payload) => unwrap(await api.patch(serviceEndpoints.kbArticle(articleId), payload)),
  remove: async (articleId) => {
    await api.delete(serviceEndpoints.kbArticle(articleId))
    return articleId
  },
  publish: async (articleId) => unwrap(await api.post(serviceEndpoints.kbArticlePublish(articleId))),
  suggestedForCase: async (caseId) => unwrap(await api.get(serviceEndpoints.caseSuggestedArticles(caseId))) || [],
}

export function useKbArticles(params) {
  return useQuery({ queryKey: serviceKeys.kbArticles(params), queryFn: () => knowledgeApi.list(params), placeholderData: (previous) => previous })
}

export function useKbArticle(articleId) {
  return useQuery({ queryKey: serviceKeys.kbArticle(articleId), queryFn: () => knowledgeApi.get(articleId), enabled: Boolean(articleId) })
}

export function useSuggestedArticles(caseId) {
  return useQuery({ queryKey: serviceKeys.caseSuggestedArticles(caseId), queryFn: () => knowledgeApi.suggestedForCase(caseId), enabled: Boolean(caseId), staleTime: 5 * 60 * 1000 })
}

export function useKbMutations() {
  const queryClient = useQueryClient()
  const onSuccess = (article) => {
    if (article?.id) queryClient.setQueryData(serviceKeys.kbArticle(article.id), article)
    queryClient.invalidateQueries({ queryKey: [...serviceKeys.kb(), 'articles'] })
    queryClient.invalidateQueries({ queryKey: [...serviceKeys.kb(), 'suggested'] })
  }
  return {
    create: useMutation({ mutationFn: knowledgeApi.create, onSuccess }),
    update: useMutation({ mutationFn: ({ id, ...payload }) => knowledgeApi.update(id, payload), onSuccess }),
    publish: useMutation({ mutationFn: knowledgeApi.publish, onSuccess }),
    remove: useMutation({ mutationFn: knowledgeApi.remove, onSuccess: () => onSuccess(null) }),
  }
}
