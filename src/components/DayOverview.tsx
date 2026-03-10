import {
  ACTIVITIES,
  RAMADAN_DAYS,
  DAY_DATES,
  useTrackerStore,
} from '#/store/trackerStore'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'

export function DayOverview() {
  const { selectedDay, setSelectedDay, getCompletedCount } = useTrackerStore()
  const totalCount = ACTIVITIES.length

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur-sm">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          সকল রাতের অগ্রগতি
        </h4>
        <div className="grid grid-cols-10 gap-2">
          {RAMADAN_DAYS.map((day) => {
            const count = getCompletedCount(day)
            const pct = (count / totalCount) * 100
            const isSelected = day === selectedDay
            return (
              <Tooltip key={day}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => useTrackerStore.getState().setSelectedDay(day)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-150',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-bold',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {day}
                    </span>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          pct === 100
                            ? 'bg-emerald-500'
                            : pct > 0
                              ? 'bg-amber-500'
                              : 'bg-transparent'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {count}/{totalCount}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">
                    {day} রমজান — {DAY_DATES[day]}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {count}/{totalCount} আমল সম্পন্ন
                  </p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
  )
}
