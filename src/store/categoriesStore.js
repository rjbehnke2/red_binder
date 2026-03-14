import { create } from 'zustand'

export const DEFAULT_CATEGORIES = [
  { id: 'mindset', name: 'Mindset', color: '#C0392B', icon: '🧠', order: 0 },
  { id: 'leadership', name: 'Leadership', color: '#8E44AD', icon: '👑', order: 1 },
  { id: 'productivity', name: 'Productivity', color: '#2980B9', icon: '⚡', order: 2 },
  { id: 'relationships', name: 'Relationships', color: '#27AE60', icon: '🤝', order: 3 },
  { id: 'health', name: 'Health & Body', color: '#E67E22', icon: '💪', order: 4 },
  { id: 'finance', name: 'Finance', color: '#F39C12', icon: '💰', order: 5 },
  { id: 'creativity', name: 'Creativity', color: '#16A085', icon: '🎨', order: 6 },
  { id: 'philosophy', name: 'Philosophy', color: '#7F8C8D', icon: '🔭', order: 7 },
]

/**
 * Categories store — manages entry categories.
 * Will be wired to Supabase in Week 2.
 */
export const useCategoriesStore = create((set) => ({
  categories: DEFAULT_CATEGORIES,
  loading: false,
  error: null,

  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),

  reorderCategories: (orderedIds) =>
    set((state) => ({
      categories: orderedIds.map((id, index) => {
        const cat = state.categories.find((c) => c.id === id)
        return { ...cat, order: index }
      }),
    })),
}))
