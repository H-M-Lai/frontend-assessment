import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

type PromptDialogProps = {
  isOpen: boolean
  title: string
  message: string
  placeholder?: string
  confirmText?: string
  isDanger?: boolean
  validate?: (value: string) => string | null
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function PromptDialog({ 
  isOpen, 
  title, 
  message, 
  placeholder = 'Enter value...',
  confirmText = 'Submit',
  isDanger = false,
  validate,
  onConfirm, 
  onCancel 
}: PromptDialogProps) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setValue('')
      setTouched(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const error = validate ? validate(value) : null
  const isValid = value.trim().length > 0 && !error

  const handleConfirm = () => {
    if (!isValid) return
    onConfirm(value)
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" 
        onClick={handleCancel} 
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:border dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
          <button 
            onClick={handleCancel} 
            className="rounded-md text-slate-400 hover:text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        
        <div className="mt-4">
          <textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setTouched(true)
            }}
            onBlur={() => setTouched(true)}
            rows={3}
            className={clsx(
              "w-full rounded-md border px-3 py-2 text-sm outline-none dark:bg-slate-900 dark:text-slate-100",
              touched && error
                ? "border-red-500 focus:border-red-600 dark:border-red-900"
                : "border-slate-300 focus:border-slate-950 dark:border-slate-700 dark:focus:border-slate-500"
            )}
            placeholder={placeholder}
            autoFocus
          />
          {touched && error ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={clsx(
              "rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors",
              isDanger
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
                : "bg-slate-950 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  )
}
