import { RAMADAN_DAYS, DAY_DATES, ACTIVITIES, useTrackerStore } from '#/store/trackerStore'
import { Moon, Calendar } from 'lucide-react'
import { cn } from '#/lib/utils'

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { selectedDay, setSelectedDay, getCompletedCount, statuses } = useTrackerStore()
  const totalActivities = ACTIVITIES.length

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 shrink-0">
      {/* Branding */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
          <Moon className="w-5 h-5 text-white" fill="white" />
        </div>
        <div>
          <p className="font-bold text-sm text-sidebar-foreground leading-tight">রমজান ট্র্যাকার</p>
          <p className="text-[11px] text-muted-foreground">১৪৪৭ হিজরি</p>
        </div>
      </div>

      {/* Day navigation */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2 mt-1">
          শেষ দশ রাত
        </p>
        <nav className="flex flex-col gap-1">
          {RAMADAN_DAYS.map((day) => {
            const completed = getCompletedCount(day)
            const isSelected = day === selectedDay
            // Check if day has any activity recorded
            const hasAny = ACTIVITIES.some((_, idx) => statuses[`${day}-${idx}`] !== undefined)
            const percent = totalActivities > 0 ? (completed / totalActivities) * 100 : 0

            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day)
                  onNavigate?.()
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {/* Day number badge */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-muted text-muted-foreground group-hover:bg-background'
                  )}
                >
                  {day}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs font-medium')}>
                      <span className="font-bold">{DAY_DATES[day]}</span>
                    </span>
                    {hasAny && (
                      <span
                        className={cn(
                          'text-[10px] font-semibold',
                          isSelected ? 'text-white/70' : 'text-muted-foreground'
                        )}
                      >
                        {completed}/{totalActivities}
                      </span>
                    )}
                  </div>
                  {/* Mini progress bar */}
                  {hasAny && (
                    <div
                      className={cn(
                        'mt-1 h-1 rounded-full overflow-hidden',
                        isSelected ? 'bg-white/20' : 'bg-muted'
                      )}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          percent === 100
                            ? 'bg-emerald-400'
                            : isSelected
                              ? 'bg-white/80'
                              : 'bg-amber-500'
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>রমজান ২১–৩০, ১৪৪৭</span>
        </div>
      </div>
    </aside>
  )
}
