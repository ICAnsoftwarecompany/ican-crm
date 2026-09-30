import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { portalEndpoints as P } from '../../service/portal-transport'
import { usePortalSession } from '../store/portalSessionStore'
import { portalHttp as http, unwrap } from './portalClient'

/** Query keys include the active membership so switching profile never shows another customer's cached data. */
export function usePortalKey() {
  const membershipId = usePortalSession((state) => state.me?.active_membership_id || 'anon')
  return (...parts) => ['portal', membershipId, ...parts]
}

export const portalApi = {
  publicSettings: async () => unwrap(await http.get(P.publicSettings)),
  requestOtp: async (target) => unwrap(await http.post(P.otp, { target })),
  verifyOtp: async ({ target, code }) => unwrap(await http.post(P.verify, { target, code })),
  login: async ({ email, password }) => unwrap(await http.post(P.login, { email, password })),
  logout: async () => http.post(P.logout),
  me: async () => unwrap(await http.get(P.me)),
  switchMembership: async (membershipId) => unwrap(await http.post(P.switchMembership, { membership_id: membershipId })),
  list: async (url, params) => unwrap(await http.get(url, { params: { per_page: 100, ...params } })) || [],
  get: async (url) => unwrap(await http.get(url)),
  post: async (url, payload) => unwrap(await http.post(url, payload)),
  patch: async (url, payload) => unwrap(await http.patch(url, payload)),
  track: async (payload) => unwrap(await http.post(P.track, payload)),
  /** Full response `{ data, meta }` (lists that carry extra meta, e.g. help center categories). */
  page: async (url, params) => (await http.get(url, { params })).data,
}

export const usePublicSettings = () => useQuery({ queryKey: ['portal', 'public-settings'], queryFn: portalApi.publicSettings, staleTime: 10 * 60 * 1000 })

export function useMe({ enabled = true } = {}) {
  const setMe = usePortalSession((state) => state.setMe)
  return useQuery({
    queryKey: ['portal', 'me'],
    queryFn: async () => {
      const me = await portalApi.me()
      setMe(me)
      return me
    },
    enabled,
  })
}

/** Generic list / detail readers for the portal resources (all scoped by the server). */
export function usePortalList(name, url, params, options = {}) {
  const key = usePortalKey()
  return useQuery({ queryKey: key(name, params ?? {}), queryFn: () => portalApi.list(url, params), ...options })
}
export function usePortalDetail(name, url, options = {}) {
  const key = usePortalKey()
  return useQuery({ queryKey: key(name, url), queryFn: () => portalApi.get(url), enabled: Boolean(url), ...options })
}

/** Portal mutation that refreshes this membership's data afterwards. */
export function usePortalMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient()
  const membershipId = usePortalSession((state) => state.me?.active_membership_id)
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['portal', membershipId] })
      options.onSuccess?.(...args)
    },
  })
}

export function useSignIn() {
  const setSession = usePortalSession((state) => state.setSession)
  const queryClient = useQueryClient()
  const onSuccess = (session) => {
    queryClient.removeQueries({ queryKey: ['portal'], predicate: (query) => query.queryKey[1] !== 'public-settings' })
    setSession(session)
  }
  return {
    requestOtp: useMutation({ mutationFn: portalApi.requestOtp }),
    verifyOtp: useMutation({ mutationFn: portalApi.verifyOtp, onSuccess }),
    login: useMutation({ mutationFn: portalApi.login, onSuccess }),
  }
}

export function useSwitchMembership() {
  const setMe = usePortalSession((state) => state.setMe)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: portalApi.switchMembership,
    onSuccess: (me) => {
      setMe(me)
      queryClient.setQueryData(['portal', 'me'], me)
    },
  })
}

export function useSignOut() {
  const clear = usePortalSession((state) => state.clear)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => portalApi.logout().catch(() => null),
    onSettled: () => {
      clear()
      queryClient.clear()
    },
  })
}
