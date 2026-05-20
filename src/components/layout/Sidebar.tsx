'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Globe2, LayoutDashboard, Newspaper, Plus } from 'lucide-react'
import clsx from 'clsx'
import { ThemeToggle } from '../shared/ThemeToggle'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/posts', label: 'Posts', icon: Newspaper },
  { href: '/public-api', label: 'Countries', icon: Globe2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={clsx(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 shadow-sm transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 dark:shadow-none',
        isCollapsed ? 'w-20 items-center' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={clsx("flex shrink-0 items-center", isCollapsed ? "justify-center" : "justify-between px-3")}>
        {!isCollapsed && (
          <span className="font-bold tracking-tight text-slate-950 dark:text-slate-100">Content Studio</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex flex-1 flex-col space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={clsx(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white',
                isCollapsed && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {/* Divider & Actions Group */}
        <div className="my-4 border-t border-slate-200/60 dark:border-slate-800/80" />

        {/* New post shortcut */}
        <Link
          href="/posts/create"
          title={isCollapsed ? 'New post' : undefined}
          className={clsx(
            'flex items-center gap-3 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-100 transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98] dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 dark:shadow-none',
            isCollapsed && 'justify-center'
          )}
        >
          <Plus className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>New post</span>}
        </Link>
      </nav>

      {/* Footer — theme toggle */}
      <div className={clsx(
        "mt-auto border-t border-slate-200 pt-4 dark:border-slate-800",
        isCollapsed ? "flex justify-center" : "flex items-center justify-between px-3"
      )}>
        {!isCollapsed && (
          <span className="text-xs text-slate-500 dark:text-slate-400">Theme</span>
        )}
        <ThemeToggle />
      </div>
    </aside>
  )
}
