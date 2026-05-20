'use client'

import { useTheme } from 'next-themes'
import { Toaster as SonnerToaster } from 'sonner'

/**
 * A wrapper around Sonner's Toaster that syncs the toast theme
 * with next-themes active light/dark state.
 */
export function AppToaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      richColors
      position="top-right"
      theme={theme as 'light' | 'dark' | 'system'}
      duration={2000}
      closeButton
    />
  )
}
