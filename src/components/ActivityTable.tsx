import {
  ACTIVITIES,
  DAY_DATES,
  useTrackerStore,
  type ActivityStatus,
} from '#/store/trackerStore'
import { DayOverview } from './DayOverview'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { CheckCircle2, XCircle, Circle } from 'lucide-react'

function StatusBadge({ status }: { status: ActivityStatus }) {
  if (status === 'yes') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
        <CheckCircle2 className="w-4 h-4" />
        হ্যাঁ
      </span>
    )
  }
  if (status === 'no') {
    return (
      <span className="inline-flex items-center gap-1 text-red-500 dark:text-red-400 font-semibold text-xs">
        <XCircle className="w-4 h-4" />
        না
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
      <Circle className="w-4 h-4" />
      বেছে নিন
    </span>
  )
}

export function ActivityTable() {
  const { selectedDay, statuses, setStatus, getCompletedCount } = useTrackerStore()
  const completedCount = getCompletedCount(selectedDay)
  const totalCount = ACTIVITIES.length
  const progressPct = (completedCount / totalCount) * 100

  return (
    <div className="flex flex-col gap-6">
      {/* Progress Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {completedCount}{' '}
              <span className="text-muted-foreground font-normal text-lg">/ {totalCount} আমল</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {completedCount === totalCount
                ? '🎉 মাশাল্লাহ! সব আমল সম্পন্ন!'
                : completedCount > 0
                  ? `আরও ${totalCount - completedCount}টি আমল বাকি আছে`
                  : 'আজকের আমল শুরু করুন'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-amber-500">{Math.round(progressPct)}%</span>
            <p className="text-xs text-muted-foreground">সম্পন্ন</p>
          </div>
        </div>
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out',
              progressPct === 100
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                : 'bg-gradient-to-r from-amber-400 to-orange-500'
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {selectedDay} রমজান{' '}
            <span className="text-muted-foreground font-normal text-base">
              — {DAY_DATES[selectedDay]}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            প্রতিটি আমলের জন্য হ্যাঁ বা না নির্বাচন করুন
          </p>
        </div>
        {/* Quick fill for odd nights (potential Laylatul Qadr) */}
        {selectedDay % 2 !== 0 && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            ✨ বেজোড় রাত
          </span>
        )}
      </div>

      {/* Activity rows */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_160px] text-[11px] font-semibold uppercase tracking-widest text-muted-foreground px-5 py-3 border-b border-border bg-muted/40">
          <span className="w-10">#</span>
          <span>আমল</span>
          <span className="text-right">অবস্থা</span>
        </div>

        <div className="divide-y divide-border">
          {ACTIVITIES.map((activity, idx) => {
            const key = `${selectedDay}-${idx}`
            const status: ActivityStatus = statuses[key] ?? 'pending'

            return (
              <div
                key={idx}
                className={cn(
                  'grid grid-cols-[auto_1fr_160px] items-center px-5 py-3.5 transition-colors duration-150 group',
                  status === 'yes'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                    : status === 'no'
                      ? 'bg-red-50/30 dark:bg-red-950/10'
                      : 'hover:bg-muted/30'
                )}
              >
                {/* Row number */}
                <span className="w-10 text-xs font-bold text-muted-foreground">{idx + 1}</span>

                {/* Activity name */}
                <span
                  className={cn(
                    'text-sm font-medium leading-snug pr-4',
                    status === 'yes'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : status === 'no'
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                  )}
                >
                  {activity}
                </span>

                {/* Status Select */}
                <div className="flex justify-end">
                  <Select
                    value={status}
                    onValueChange={(val) =>
                      setStatus(selectedDay, idx, val as ActivityStatus)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        'w-36 h-8 text-xs font-medium border rounded-lg transition-all',
                        status === 'yes'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : status === 'no'
                            ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400'
                            : 'border-border bg-background text-muted-foreground'
                      )}
                    >
                      <SelectValue>
                        <StatusBadge status={status} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">
                        <span className="flex items-center gap-2 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> হ্যাঁ
                        </span>
                      </SelectItem>
                      <SelectItem value="no">
                        <span className="flex items-center gap-2 text-red-500 font-semibold">
                          <XCircle className="w-4 h-4" /> না
                        </span>
                      </SelectItem>
                      <SelectItem value="pending">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Circle className="w-4 h-4" /> বেছে নিন
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <DayOverview />
    </div>
  )
}
