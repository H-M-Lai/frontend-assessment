import { AlertTriangle } from 'lucide-react'

type ErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
      <AlertTriangle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400" />
      <h2 className="mt-3 text-sm font-semibold text-red-950 dark:text-red-300">{title}</h2>
      <p className="mt-1 text-sm text-red-700 dark:text-red-400">{message}</p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
