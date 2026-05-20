'use client'

import { Sidebar } from './Sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100 transition-colors duration-300 dark:bg-slate-900">
      <Sidebar />
      
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
