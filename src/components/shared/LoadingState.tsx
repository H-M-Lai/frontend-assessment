import { Loader2 } from 'lucide-react'

type LoadingStateProps = {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      <span>{message}</span>
    </div>
  )
}
