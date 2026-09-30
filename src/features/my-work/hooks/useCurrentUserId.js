import { useAuthStore } from '../../../store/authStore'

/** The signed-in user's id, whatever key the login response used. */
export function useCurrentUserId() {
  return useAuthStore((state) => state.user?.id ?? state.user?.user_id ?? state.user?.userId ?? null)
}
