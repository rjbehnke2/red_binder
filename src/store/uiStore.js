import { create } from 'zustand'

/**
 * UI store — manages global UI state like modals, toasts, sidebar.
 */
export const useUIStore = create((set) => ({
  // Sidebar / nav
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Modals
  modal: null,          // { type: string, props: object }
  openModal: (type, props = {}) => set({ modal: { type, props } }),
  closeModal: () => set({ modal: null }),

  // Toasts / notifications
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), ...toast }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Quick capture sheet
  quickCaptureOpen: false,
  setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),

  // Browse view mode
  viewMode: 'card',     // 'card' | 'list'
  setViewMode: (mode) => set({ viewMode: mode }),
}))
