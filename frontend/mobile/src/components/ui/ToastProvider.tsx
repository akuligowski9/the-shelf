import React, { createContext, useContext, useState, useCallback } from 'react'
import { Toast, ToastType } from './Toast'

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showWarning: (message: string) => void
  showInfo: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<ToastType>('info')
  const [duration, setDuration] = useState(3000)

  const showToast = useCallback(
    (msg: string, toastType: ToastType = 'info', toastDuration: number = 3000) => {
      setMessage(msg)
      setType(toastType)
      setDuration(toastDuration)
      setVisible(true)
    },
    []
  )

  const showSuccess = useCallback((msg: string) => {
    showToast(msg, 'success')
  }, [showToast])

  const showError = useCallback((msg: string) => {
    showToast(msg, 'error', 4000)
  }, [showToast])

  const showWarning = useCallback((msg: string) => {
    showToast(msg, 'warning')
  }, [showToast])

  const showInfo = useCallback((msg: string) => {
    showToast(msg, 'info')
  }, [showToast])

  const handleHide = useCallback(() => {
    setVisible(false)
  }, [])

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <Toast
        visible={visible}
        message={message}
        type={type}
        duration={duration}
        onHide={handleHide}
      />
    </ToastContext.Provider>
  )
}
