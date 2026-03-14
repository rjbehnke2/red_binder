import { useEntriesStore } from '../store/entriesStore'

/**
 * useEntries — convenience hook for entry operations.
 * Will fetch from Supabase in Week 2.
 */
export function useEntries() {
  const entries = useEntriesStore((s) => s.entries)
  const loading = useEntriesStore((s) => s.loading)
  const addEntry = useEntriesStore((s) => s.addEntry)
  const updateEntry = useEntriesStore((s) => s.updateEntry)
  const removeEntry = useEntriesStore((s) => s.removeEntry)

  return { entries, loading, addEntry, updateEntry, removeEntry }
}
