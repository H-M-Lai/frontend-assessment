import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title?: string
  message: string
}

export function EmptyState({ title = 'Nothing here yet', message }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
      <Inbox className="mx-auto h-8 w-8 text-slate-400" />
      <h2 className="mt-3 text-sm font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  )
}
