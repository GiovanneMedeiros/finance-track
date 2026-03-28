import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import clsx from 'clsx'

import { Button } from '@/components/ui/Button'

const sizeClasses = {
  md: 'max-w-xl',
  lg: 'max-w-2xl',
}

export function Modal({ open, title, description, size = 'md', onClose, children }) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/25 p-4 backdrop-blur-sm dark:bg-slate-950/70 sm:items-center">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className={clsx('panel-strong animated-enter relative z-10 w-full border-emerald-400/15 p-6 sm:p-7', sizeClasses[size])}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl text-slate-950 dark:text-white">{title}</h2>
            {description ? (
              <p className="max-w-md text-sm text-[var(--text-secondary)]">
                {description}
              </p>
            ) : null}
          </div>

          <Button
            aria-label="Fechar modal"
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  )
}