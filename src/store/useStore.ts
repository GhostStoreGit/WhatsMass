import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DashboardStats, InstanceStatus } from '@/types'

interface AppState {
  // Connection
  connectionStatus: InstanceStatus
  qrCode: string | null
  phoneNumber: string | null

  // Stats
  stats: DashboardStats | null

  // UI
  sidebarOpen: boolean

  // Actions
  setConnectionStatus: (status: InstanceStatus) => void
  setQrCode: (qr: string | null) => void
  setPhoneNumber: (phone: string | null) => void
  setStats: (stats: DashboardStats) => void
  setSidebarOpen: (open: boolean) => void
  reset: () => void
}

const initialState = {
  connectionStatus: 'DISCONNECTED' as InstanceStatus,
  qrCode: null,
  phoneNumber: null,
  stats: null,
  sidebarOpen: true,
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setQrCode: (qr) => set({ qrCode: qr }),
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      setStats: (stats) => set({ stats }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      reset: () => set(initialState),
    }),
    {
      name: 'whatsapp-automation-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
