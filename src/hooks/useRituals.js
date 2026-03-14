import { useRitualsStore } from '../store/ritualsStore'

/**
 * useRituals — convenience hook for ritual state.
 * Will fetch from Supabase in Week 4.
 */
export function useRituals() {
  const store = useRitualsStore()
  return store
}
