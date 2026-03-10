'use client'

import { useCloudSyncStore } from '#/store/cloudSyncStore'
import { Check } from 'lucide-react'

export function SyncToast() {
  const toast = useCloudSyncStore((s) => s.toast)

  if (!toast) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg bg-emerald-600 text-white text-sm font-medium">
      <Check className="h-4 w-4 shrink-0" />
      {toast.message}
    </div>
  )
}
