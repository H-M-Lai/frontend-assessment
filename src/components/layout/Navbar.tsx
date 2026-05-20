'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ThemeToggle } from '../shared/ThemeToggle'

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-14 items-center justify-end gap-2 px-4 sm:px-6 lg:px-8">
        <ThemeToggle />
        <Link
          href="/posts"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          View posts
        </Link>
        <Link
          href="/posts/create"
          className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>
    </header>
  )
}
