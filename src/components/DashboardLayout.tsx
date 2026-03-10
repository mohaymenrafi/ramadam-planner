import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { ActivityTable } from './ActivityTable'
import { RestoreBanner } from './RestoreBanner'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '#/components/ui/sheet'
import { Button } from '#/components/ui/button'
import { Menu } from 'lucide-react'
import { cn } from '#/lib/utils'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16',
          'bg-sidebar border-r border-sidebar-border w-64 shrink-0'
        )}
      >
        <Sidebar />
      </aside>

      {/* Mobile sidebar trigger */}
      <div className="lg:hidden fixed bottom-4 left-4 z-40">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="h-12 w-12 rounded-full shadow-lg"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">মেনু খুলুন</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto px-4 py-6 lg:px-8">
        <RestoreBanner />
        <ActivityTable />
      </main>
    </div>
  )
}
