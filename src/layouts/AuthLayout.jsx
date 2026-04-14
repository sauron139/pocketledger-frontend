import { useEffect } from 'react'
import { applyTheme, getStoredTheme } from '@/lib/themes'

export function AuthLayout({ children }) {
  useEffect(() => { applyTheme(getStoredTheme()) }, [])
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--pl-primary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 16C4 9.373 9.373 4 16 4s12 5.373 12 12-5.373 12-12 12S4 22.627 4 16z" fill="var(--pl-primary)"/>
              <path d="M16 9v14M10 13h9a3 3 0 010 6h-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">PocketLedger</h1>
          <p className="text-white/60 mt-1 text-sm">Your personal finance tracker</p>
        </div>
        {children}
      </div>
    </div>
  )
}
