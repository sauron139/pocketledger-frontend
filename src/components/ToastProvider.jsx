import { createContext, useContext } from 'react'
import { useToast, ToastContainer } from '@/hooks/useToast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const { toasts, toast, dismiss } = useToast()
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  return useContext(ToastContext)
}
