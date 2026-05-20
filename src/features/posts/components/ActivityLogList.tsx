'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ActivityLog } from '../types/post.types'

type ActivityLogListProps = {
  logs: ActivityLog[]
}

export function ActivityLogList({ logs }: ActivityLogListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (logs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        No activity logs found.
      </div>
    )
  }

  const visibleLogs = isExpanded ? logs : logs.slice(0, 3)
  const hasMore = logs.length > 3

  return (
    <div className="space-y-3">
      <div className="max-h-[400px] space-y-px overflow-y-auto rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        {visibleLogs.map((log, index) => (
          <div
            key={log.id}
            className={`px-4 py-3 ${index !== visibleLogs.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/50' : ''}`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-950 dark:text-slate-100">{log.action}</span>
              <span className="shrink-0 whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">
                {dayjs(log.timestamp).format('DD MMM YYYY, h:mm A')}
              </span>
            </div>

            {log.rejectionReason ? (
              <p className="mt-2 rounded bg-red-50 px-2.5 py-1.5 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-400">
                {log.rejectionReason}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show all {logs.length} logs
            </>
          )}
        </button>
      )}
    </div>
  )
}
