'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '#/lib/supabase'
import { saveProgressToCloud, loadProgressFromCloud } from '#/lib/sync'
import { useTrackerStore } from '#/store/trackerStore'
import { useCloudSyncStore } from '#/store/cloudSyncStore'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { Button } from '#/components/ui/button'
import { Cloud, CloudOff, Loader2, Check, Mail, RefreshCw } from 'lucide-react'
import { cn } from '#/lib/utils'

const isConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return Boolean(url && key)
}

export function CloudSync() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const [linkSent, setLinkSent] = useState(false)
  const [linkSentEmail, setLinkSentEmail] = useState('')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { sheetOpen, setSheetOpen, initialLoadComplete } = useCloudSyncStore()
  const { statuses, selectedDay } = useTrackerStore()

  const loadUser = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser()
    setUser(u ? { email: u.email ?? '' } : null)
  }, [])

  // Auth state for UI; AuthSync handles load on reload
  useEffect(() => {
    if (!isConfigured()) return
    loadUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
      setLinkSent(false)
    })
    return () => subscription.unsubscribe()
  }, [loadUser])

  // Safety: if we have user but initialLoadComplete never got set (edge case), allow save after 2s
  useEffect(() => {
    if (!user || initialLoadComplete) return
    const t = setTimeout(() => useCloudSyncStore.getState().setInitialLoadComplete(true), 2000)
    return () => clearTimeout(t)
  }, [user, initialLoadComplete])

  // Auto-save on every change when signed in (debounced 300ms).
  // Must wait for initialLoadComplete so we don't overwrite cloud with stale localStorage on reload.
  useEffect(() => {
    if (!isConfigured() || !user || !initialLoadComplete) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      const result = await saveProgressToCloud()
      if (result.ok) {
        setLastSyncedAt(new Date())
      }
      saveTimeoutRef.current = null
    }, 300)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [user, initialLoadComplete, statuses, selectedDay])

  const handleSignIn = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'ইমেইল লিখুন' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
      })
      if (error) throw error
      setLinkSent(true)
      setLinkSentEmail(email.trim())
      setMessage({
        type: 'success',
        text: 'ইমেইল পাঠানো হয়েছে! আপনার ইমেইল চেক করুন।',
      })
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setMessage(null)
    handleSignIn()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMessage(null)
    setLinkSent(false)
    setLastSyncedAt(null)
    setSheetOpen(false)
    useCloudSyncStore.getState().setInitialLoadComplete(false)
  }

  const handleManualSave = async () => {
    setSyncing(true)
    setMessage(null)
    const result = await saveProgressToCloud()
    setSyncing(false)
    if (result.ok) {
      setLastSyncedAt(new Date())
      setMessage({ type: 'success', text: 'সেভ হয়েছে!' })
      setTimeout(() => setMessage(null), 2000)
    } else {
      setMessage({ type: 'error', text: result.error ?? 'ত্রুটি' })
    }
  }

  const handleLoadFromCloud = async () => {
    setSyncing(true)
    setMessage(null)
    const result = await loadProgressFromCloud()
    setSyncing(false)
    if (result.ok && result.data) {
      useTrackerStore.setState({
        statuses: result.data.statuses,
        selectedDay: result.data.selectedDay,
      })
      setMessage({ type: 'success', text: 'প্রোগ্রেস লোড হয়েছে!' })
      useCloudSyncStore.getState().showToast('প্রোগ্রেস পুনরুদ্ধার হয়েছে!')
    } else {
      setMessage({ type: 'error', text: result.error ?? 'ত্রুটি' })
    }
  }

  const configured = isConfigured()

  const formatLastSynced = (d: Date) => {
    const sec = Math.floor((Date.now() - d.getTime()) / 1000)
    if (sec < 60) return 'একটু আগে'
    if (sec < 3600) return `${Math.floor(sec / 60)} মিনিট আগে`
    return `${Math.floor(sec / 3600)} ঘণ্টা আগে`
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            {user ? (
              <Cloud className="h-4 w-4 text-emerald-500" />
            ) : (
              <CloudOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="hidden sm:inline">
              {user ? 'ক্লাউড' : 'সেভ করুন'}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              প্রোগ্রেস সিঙ্ক করুন
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4">
            {!configured ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400 mb-2">
                  Supabase কনফিগার করা হয়নি
                </p>
                <p className="text-muted-foreground mb-3">
                  <code>.env</code> ফাইলে যোগ করুন এবং dev server রিস্টার্ট করুন:
                </p>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key`}
                </pre>
                <p className="text-muted-foreground mt-3 text-xs">
                  SUPABASE_SETUP.md দেখুন
                </p>
              </div>
            ) : user ? (
              <>
                <p className="text-sm text-muted-foreground">
                  আপনার প্রোগ্রেস প্রতিটি পরিবর্তনের সাথে স্বয়ংক্রিয়ভাবে ক্লাউডে সেভ হয়। অন্য ডিভাইসে সাইন ইন করলে প্রোগ্রেস পুনরুদ্ধার করতে পারবেন।
                </p>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {lastSyncedAt
                          ? `সর্বশেষ সিঙ্ক: ${formatLastSynced(lastSyncedAt)}`
                          : 'স্বয়ংক্রিয় সিঙ্ক সক্রিয়'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={handleLoadFromCloud}
                    disabled={syncing}
                    className="w-full gap-2"
                  >
                    {syncing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    অন্য ডিভাইস থেকে প্রোগ্রেস লোড করুন
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleManualSave}
                    disabled={syncing}
                    className="w-full gap-2 text-muted-foreground"
                  >
                    {syncing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Cloud className="h-4 w-4" />
                    )}
                    এখনই সেভ করুন
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-muted-foreground mt-2"
                  >
                    সাইন আউট
                  </Button>
                </div>
              </>
            ) : linkSent ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    ইমেইল চেক করুন
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {linkSentEmail}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    লিংক ক্লিক করলে প্রোগ্রেস স্বয়ংক্রিয়ভাবে সিঙ্ক হবে
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  আবার পাঠান
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  ইমেইল দিন। আমরা একটি লিংক পাঠাব। লিংক ক্লিক করলে যেকোনো ডিভাইসে প্রোগ্রেস পাবেন।
                </p>
                <div className="flex flex-col gap-2">
                  <label htmlFor="cloud-email" className="text-sm font-medium">
                    ইমেইল
                  </label>
                  <input
                    id="cloud-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className={cn(
                      'flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm',
                      'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  />
                  <Button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="w-full gap-2 h-10"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    লিংক পাঠান
                  </Button>
                </div>
              </div>
            )}

            {message && !linkSent && (
              <div
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-3 text-sm',
                  message.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                {message.type === 'success' && <Check className="h-4 w-4 shrink-0" />}
                {message.text}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
