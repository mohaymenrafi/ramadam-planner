'use client'

import { useState, useEffect } from 'react'
import { supabase } from '#/lib/supabase'
import { useTrackerStore } from '#/store/trackerStore'
import { useCloudSyncStore } from '#/store/cloudSyncStore'
import { Button } from '#/components/ui/button'
import { Cloud, X } from 'lucide-react'

const isConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return Boolean(url && key)
}

export function RestoreBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const statuses = useTrackerStore((s) => s.statuses)
  const openSheet = useCloudSyncStore((s) => s.openSheet)

  const hasLocalData = Object.keys(statuses).length > 0

  useEffect(() => {
    if (!isConfigured()) return
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ? { email: u.email ?? '' } : null)
    })
  }, [])

  if (!isConfigured() || user || hasLocalData || dismissed) return null

  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Cloud className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">আরেক ডিভাইসে প্রোগ্রেস আছে?</p>
          <p className="text-xs text-muted-foreground">
            ইমেইল দিয়ে সাইন ইন করলে প্রোগ্রেস পুনরুদ্ধার হবে
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" onClick={openSheet}>
          সাইন ইন
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="বন্ধ করুন"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
