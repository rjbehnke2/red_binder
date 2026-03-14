import { create } from 'zustand'

/**
 * Rituals store — tracks daily/weekly ritual state and streaks.
 * Will be wired to Supabase in Week 4.
 */
export const useRitualsStore = create((set) => ({
  // Current ritual session
  activeRitual: null,       // 'daily' | 'weekly' | null
  currentStep: 0,
  ritualData: {},           // collects user responses during ritual

  // History
  rituals: [],              // completed ritual records
  loading: false,

  setActiveRitual: (type) => set({ activeRitual: type, currentStep: 0, ritualData: {} }),
  clearActiveRitual: () => set({ activeRitual: null, currentStep: 0, ritualData: {} }),

  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  setRitualData: (key, value) =>
    set((state) => ({ ritualData: { ...state.ritualData, [key]: value } })),

  setRituals: (rituals) => set({ rituals }),
  addRitual: (ritual) =>
    set((state) => ({ rituals: [ritual, ...state.rituals] })),

  // Computed: did user complete daily ritual today?
  completedTodayDaily: false,
  completedTodayWeekly: false,
  streak: 0,

  setStreak: (streak) => set({ streak }),
  setCompletedToday: (type, value) =>
    set(type === 'daily'
      ? { completedTodayDaily: value }
      : { completedTodayWeekly: value }
    ),
}))
