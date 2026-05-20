import { X } from 'lucide-react'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" 
        onClick={onCancel} 
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:border dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
          <button 
            onClick={onCancel} 
            className="rounded-md text-slate-400 hover:text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )
}
