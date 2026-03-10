import { supabase, type ProgressRow } from './supabase'
import { useTrackerStore } from '#/store/trackerStore'

// Serialize saves: only one save at a time. Prevents out-of-order completion
// where an older save overwrites a newer one when both run concurrently.
let saveInProgress = false
let savePending = false

async function doSave(): Promise<{ ok: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in' }

  const { statuses, selectedDay } = useTrackerStore.getState()

  const { error } = await supabase
    .from('progress')
    .upsert(
      {
        user_id: user.id,
        statuses,
        selected_day: selectedDay,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function saveProgressToCloud(): Promise<{ ok: boolean; error?: string }> {
  if (saveInProgress) {
    savePending = true
    while (saveInProgress) {
      await new Promise((r) => setTimeout(r, 50))
    }
    if (savePending) {
      savePending = false
      return saveProgressToCloud()
    }
    return { ok: true }
  }

  saveInProgress = true
  savePending = false

  try {
    const result = await doSave()
    if (savePending) {
      savePending = false
      saveInProgress = false
      return saveProgressToCloud()
    }
    return result
  } finally {
    saveInProgress = false
    if (savePending) {
      savePending = false
      void saveProgressToCloud()
    }
  }
}

export async function loadProgressFromCloud(): Promise<{
  ok: boolean
  error?: string
  data?: { statuses: Record<string, 'yes' | 'no' | 'pending'>; selectedDay: number }
}> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in' }

  const { data, error } = await supabase
    .from('progress')
    .select('statuses, selected_day')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No row - new user, nothing to load
      return { ok: true, data: { statuses: {}, selectedDay: 21 } }
    }
    return { ok: false, error: error.message }
  }

  const row = data as Pick<ProgressRow, 'statuses' | 'selected_day'>
  return {
    ok: true,
    data: {
      statuses: (row.statuses ?? {}) as Record<string, 'yes' | 'no' | 'pending'>,
      selectedDay: row.selected_day ?? 21,
    },
  }
}
