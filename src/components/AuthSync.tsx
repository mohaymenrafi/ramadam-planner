'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '#/lib/supabase'
import { loadProgressFromCloud, saveProgressToCloud } from '#/lib/sync'
import { useTrackerStore } from '#/store/trackerStore'
import { useCloudSyncStore } from '#/store/cloudSyncStore'

const isConfigured = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

/**
 * Runs early in app lifecycle to load cloud data on reload.
 * Subscribes to auth immediately so we don't miss INITIAL_SESSION.
 * Subscribes to Realtime for progress table so other browsers get updates.
 */
export function AuthSync() {
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!isConfigured()) return

    const loadFromCloud = async () => {
      const result = await loadProgressFromCloud()
      if (result.ok && result.data) {
        const hasData = Object.keys(result.data.statuses).length > 0
        if (hasData) {
          useTrackerStore.setState({
            statuses: result.data.statuses,
            selectedDay: result.data.selectedDay,
          })
        }
      }
      useCloudSyncStore.getState().setInitialLoadComplete(true)
    }

    const setupRealtime = () => {
      realtimeChannelRef.current?.unsubscribe()
      realtimeChannelRef.current = supabase
        .channel('progress-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'progress',
          },
          () => {
            const store = useCloudSyncStore.getState()
            const justSaved = store.lastSaveAt && Date.now() - store.lastSaveAt < 3000
            if (justSaved) return
            loadProgressFromCloud().then((result) => {
              if (result.ok && result.data) {
                useCloudSyncStore.getState().setSkipNextSave(true)
                useTrackerStore.setState({
                  statuses: result.data!.statuses,
                  selectedDay: result.data!.selectedDay,
                })
                useCloudSyncStore.getState().showToast('প্রোগ্রেস আপডেট হয়েছে!')
              }
            })
          }
        )
        .subscribe()
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const result = await loadProgressFromCloud()
          if (result.ok && result.data) {
            const hasData = Object.keys(result.data.statuses).length > 0
            if (hasData) {
              useTrackerStore.setState({
                statuses: result.data.statuses,
                selectedDay: result.data.selectedDay,
              })
              if (event === 'SIGNED_IN') {
                useCloudSyncStore.getState().showToast('আপনার প্রোগ্রেস পুনরুদ্ধার হয়েছে!')
              }
            }
            useCloudSyncStore.getState().setInitialLoadComplete(true)
            if (!hasData) {
              if (event === 'SIGNED_IN') {
                useCloudSyncStore.getState().showToast('সাইন ইন সফল! প্রোগ্রেস স্বয়ংক্রিয়ভাবে সেভ হবে।')
              }
              saveProgressToCloud()
            }
            setupRealtime()
          }
        }
      } else if (event === 'SIGNED_OUT') {
        realtimeChannelRef.current?.unsubscribe()
        realtimeChannelRef.current = null
      }
    })

    // Fallback: session may restore before we subscribed; check after a delay
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await loadFromCloud()
        setupRealtime()
      } else {
        useCloudSyncStore.getState().setInitialLoadComplete(true)
      }
    }, 500)

    return () => {
      subscription.unsubscribe()
      realtimeChannelRef.current?.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  return null
}
