import { create } from 'zustand'

interface CloudSyncStore {
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  openSheet: () => void
  toast: { message: string; type: 'success' | 'info' } | null
  showToast: (message: string, type?: 'success' | 'info') => void
  clearToast: () => void
  /** Set by AuthSync when cloud load is done. CloudSync must not save before this. */
  initialLoadComplete: boolean
  setInitialLoadComplete: (done: boolean) => void
  /** Skip next save cycle (e.g. after Realtime load) to prevent save→realtime→save loop */
  skipNextSave: boolean
  setSkipNextSave: (skip: boolean) => void
  /** Timestamp of last save; used to avoid showing toast for our own Realtime events */
  lastSaveAt: number | null
  setLastSaveAt: (t: number | null) => void
}

export const useCloudSyncStore = create<CloudSyncStore>((set) => ({
  sheetOpen: false,
  setSheetOpen: (open) => set({ sheetOpen: open }),
  openSheet: () => set({ sheetOpen: true }),
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 4000)
  },
  clearToast: () => set({ toast: null }),
  initialLoadComplete: false,
  setInitialLoadComplete: (done) => set({ initialLoadComplete: done }),
  skipNextSave: false,
  setSkipNextSave: (skip) => set({ skipNextSave: skip }),
  lastSaveAt: null,
  setLastSaveAt: (t) => set({ lastSaveAt: t }),
}))
