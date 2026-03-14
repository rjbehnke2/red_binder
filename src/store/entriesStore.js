import { create } from 'zustand'

/**
 * Entries store — manages all knowledge entries.
 * Will be wired to Supabase in Week 2.
 */
export const useEntriesStore = create((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  setEntries: (entries) => set({ entries }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addEntry: (entry) =>
    set((state) => ({ entries: [entry, ...state.entries] })),

  updateEntry: (id, updates) =>
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),

  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),

  getEntryById: (id) => get().entries.find((e) => e.id === id),
}))
