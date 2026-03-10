import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '#/components/DashboardLayout'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <main className="min-h-screen">
      <DashboardLayout />
    </main>
  )
}
