import { Link } from '@tanstack/react-router'
import { useTrackerStore } from '#/store/trackerStore'
import { ACTIVITIES, DAY_DATES } from '#/store/trackerStore'
import { Progress } from '#/components/ui/progress'
import ThemeToggle from './ThemeToggle'
import { CloudSync } from './CloudSync'
import { Moon } from 'lucide-react'

export default function Header() {
  const { selectedDay, getCompletedCount } = useTrackerStore()
  const completedCount = getCompletedCount(selectedDay)
  const totalCount = ACTIVITIES.length
  const progressPct = (completedCount / totalCount) * 100

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl px-4">
      <nav className="page-wrap flex flex-wrap items-center gap-x-4 gap-y-3 py-3 sm:py-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-foreground no-underline transition hover:bg-accent"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Moon className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-base">রমজান আমল ট্র্যাকার</span>
        </Link>

        <div className="flex-1 min-w-0" />

        <CloudSync />
        <ThemeToggle />

        {/* Progress summary card */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card/80 backdrop-blur-sm px-4 py-2.5 shadow-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              {selectedDay} রমজান — {DAY_DATES[selectedDay]}
            </p>
            <p className="text-sm font-bold text-foreground">
              {completedCount} / {totalCount} আমল সম্পন্ন
            </p>
          </div>
          <div className="w-24">
            <Progress value={progressPct} className="h-2" />
          </div>
        </div>
      </nav>
    </header>
  )
}
