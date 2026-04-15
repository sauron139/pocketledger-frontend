import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutDashboard, ArrowLeftRight, Target, BarChart2, Settings, LogOut, Wallet, Tag, Menu, X, User, RefreshCw } from 'lucide-react'
import { clearCredentials, selectCurrentUser } from '@/features/auth/authSlice'
import { authApi } from '@/api'
import { cn } from '@/lib/utils'
import { applyTheme, getStoredTheme } from '@/lib/themes'
import { NotificationBell } from '@/components/NotificationBell'

const mobileNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const desktopNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/recurring', icon: RefreshCw, label: 'Recurring' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function AppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { applyTheme(getStoredTheme()) }, [])

  async function handleLogout() {
    try { await authApi.logout() } catch {}
    dispatch(clearCredentials())
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--pl-light)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn('fixed md:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-200', sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')} style={{ backgroundColor: 'var(--pl-primary)' }}>
        <div className="px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><Wallet className="h-4 w-4 text-white" /></div>
            <span className="font-bold text-white text-lg tracking-tight">PocketLedger</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {desktopNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors', isActive ? 'bg-white' : 'text-white/75 hover:bg-white/10 hover:text-white')}
              style={({ isActive }) => isActive ? { color: 'var(--pl-primary)' } : {}}
            >
              <Icon className="h-4 w-4 shrink-0" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 mx-3 mb-4 rounded-xl bg-white/10">
          <div className="px-2 py-1.5 mb-1">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-white/60">{user?.base_currency} account</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white/75 hover:bg-white/10 hover:text-white w-full transition-colors">
            <LogOut className="h-4 w-4" />Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{ backgroundColor: 'var(--pl-light)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--pl-primary)' }}><Menu className="h-5 w-5" /></button>
          <span className="font-bold tracking-widest text-sm" style={{ color: 'var(--pl-primary)' }}>POCKETLEDGER</span>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pl-light)', border: '1.5px solid var(--pl-primary)' }}>
              <User className="h-4 w-4" style={{ color: 'var(--pl-primary)' }} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto pb-24 md:pb-0"><Outlet /></main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10 px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {mobileNav.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => cn('flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl text-[10px] font-medium transition-all', isActive ? 'text-white' : 'text-gray-400')}
                style={({ isActive }) => isActive ? { backgroundColor: 'var(--pl-primary)' } : {}}
              >
                <Icon className="h-5 w-5" /><span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
