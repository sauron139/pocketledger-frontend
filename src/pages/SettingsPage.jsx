import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { usersApi } from '@/api'
import { selectCurrentUser, updateUser, clearCredentials } from '@/features/auth/authSlice'
import { useState } from 'react'
import { User, Lock, Eye, EyeOff, Bell, Palette, Info, ChevronRight, LogOut, X, Plus } from 'lucide-react'
import { useToastContext } from '@/components/ToastProvider'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api'
import { THEMES, applyTheme } from '@/lib/themes'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCreateCategory } from '@/hooks/queries'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between shrink-0" style={{ backgroundColor: 'var(--pl-primary)' }}>
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function SettingsRow({ icon: Icon, title, subtitle, badge, onClick, danger }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 px-5 py-4 transition-colors text-left hover:opacity-80">
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: danger ? '#fef2f2' : 'var(--pl-light)' }}>
        <Icon className="h-4 w-4" style={{ color: danger ? '#ef4444' : 'var(--pl-primary)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: danger ? '#ef4444' : '#111827' }}>{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {badge && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--pl-light)', color: 'var(--pl-primary)' }}>{badge}</span>}
      {!danger && <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />}
    </button>
  )
}

export function SettingsPage() {
  usePageTitle('Settings')
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToastContext()
  const [modal, setModal] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('pl_avatar') || '')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('pl_theme') || 'burgundy')
  const createCategory = useCreateCategory()
  const catForm = useForm({ defaultValues: { type: 'expense' } })

  const profileForm = useForm({
    defaultValues: {
      email: user?.email, base_currency: user?.base_currency,
      first_name: user?.first_name || '', last_name: user?.last_name || '',
      middle_name: user?.middle_name || '', phone: user?.phone || '', address: user?.address || '',
    }
  })
  const passwordForm = useForm()
  const inp = "w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"

  async function onProfileSubmit(data) {
    setProfileLoading(true)
    try {
      const res = await usersApi.update(data)
      dispatch(updateUser(res.data.data))
      toast({ message: 'Profile updated successfully', type: 'success' })
      setModal(null)
    } catch (e) {
      toast({ message: e.response?.data?.message || 'Update failed', type: 'error' })
    } finally { setProfileLoading(false) }
  }

  async function onPasswordSubmit(data) {
    setPasswordLoading(true)
    try {
      await usersApi.changePassword(data)
      passwordForm.reset()
      toast({ message: 'Password changed successfully', type: 'success' })
      setModal(null)
    } catch (e) {
      toast({ message: e.response?.data?.message || 'Change failed', type: 'error' })
    } finally { setPasswordLoading(false) }
  }

  async function onCatSubmit(data) {
    try {
      await createCategory.mutateAsync({ ...data, icon: 'Tag' })
      toast({ message: 'Category created', type: 'success' })
      catForm.reset()
    } catch (e) {
      toast({ message: e.response?.data?.message || 'Failed', type: 'error' })
    }
  }

  function handleAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      localStorage.setItem('pl_avatar', ev.target.result)
      setAvatarUrl(ev.target.result)
      toast({ message: 'Profile picture updated', type: 'success' })
    }
    reader.readAsDataURL(file)
  }

  async function handleLogout() {
    try { await authApi.logout() } catch {}
    dispatch(clearCredentials())
    navigate('/login')
  }

  function handleThemeChange(name) {
    applyTheme(name)
    setCurrentTheme(name)
    toast({ message: `Theme changed to ${THEMES[name].name}`, type: 'success' })
  }

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email?.split('@')[0]

  return (
    <div className="px-5 py-4 space-y-4 max-w-xl mx-auto">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--pl-light)' }}>
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-2xl" /> : <User className="h-10 w-10" style={{ color: "var(--pl-primary)" }} />}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white cursor-pointer" style={{ backgroundColor: "var(--pl-primary)" }}>
            <input type="file" accept="image/*" className="sr-only" onChange={handleAvatar} />
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </label>
        </div>
        <p className="text-lg font-bold text-gray-900">{displayName}</p>
        <p className="text-sm text-gray-400 mb-3">{user?.email}</p>
        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'var(--pl-light)', color: 'var(--pl-primary)' }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: 'var(--pl-primary)' }} />
          {user?.base_currency} Account
        </span>
        <button onClick={() => setModal('profile')} className="w-full mt-4 h-11 text-white rounded-xl text-sm font-semibold transition-colors" style={{ backgroundColor: 'var(--pl-primary)' }}>
          Update Account
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-5 pt-5 pb-1">Account & Identity</p>
        <SettingsRow icon={User} title="Personal Information" subtitle="Update your details and private credentials" onClick={() => setModal('profile')} />
        <div className="h-px bg-gray-50 mx-5" />
        <SettingsRow icon={Lock} title="Security & Privacy" subtitle="Manage password and active session tokens" onClick={() => setModal('password')} />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-5 pt-5 pb-1">Preferences</p>
        <SettingsRow icon={Bell} title="Notifications" subtitle="Configure spending alerts and daily digests" badge="Active" onClick={() => {}} />
        <div className="h-px bg-gray-50 mx-5" />
        <SettingsRow icon={Palette} title="Interface Theme" subtitle={`Current: ${THEMES[currentTheme]?.name}`} onClick={() => setModal('theme')} />
        <div className="h-px bg-gray-50 mx-5" />
        <SettingsRow icon={Plus} title="Manage Categories" subtitle="Add or remove transaction categories" onClick={() => setModal('category')} />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-5 pt-5 pb-1">System</p>
        <SettingsRow icon={Info} title="About PocketLedger" subtitle="v1.0.0 • Personal Finance Tracker" onClick={() => setModal('about')} />
      </div>

      <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 bg-white rounded-3xl shadow-sm border border-gray-50 text-left hover:bg-red-50 transition-colors">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><LogOut className="h-4 w-4 text-red-500" /></div>
        <span className="text-sm font-semibold text-red-500">Sign Out</span>
      </button>

      {modal === 'profile' && (
        <Modal title="Personal Information" onClose={() => setModal(null)}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First name</label><input className={inp} {...profileForm.register('first_name')} /></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last name</label><input className={inp} {...profileForm.register('last_name')} /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Middle name</label><input className={inp} {...profileForm.register('middle_name')} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email address</label><input type="email" className={inp} {...profileForm.register('email', { required: true })} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone number</label><input type="tel" placeholder="+234..." className={inp} {...profileForm.register('phone')} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</label><input placeholder="Your address" className={inp} {...profileForm.register('address')} /></div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Base currency</label>
              <select className={inp} {...profileForm.register('base_currency')}>{['NGN','USD','EUR','GBP','USDT'].map(c => <option key={c}>{c}</option>)}</select>
              <p className="text-xs text-gray-400">Does not affect historical transactions</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(null)} className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={profileLoading} className="flex-1 h-11 text-white rounded-xl text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--pl-primary)' }}>
                {profileLoading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'password' && (
        <Modal title="Security & Privacy" onClose={() => setModal(null)}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current password</label>
              <div className="relative">
                <input type={showCurrentPw ? 'text' : 'password'} placeholder="Enter current password" className={`${inp} pr-10`} {...passwordForm.register('current_password', { required: true })} />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New password</label>
              <div className="relative">
                <input type={showNewPw ? 'text' : 'password'} placeholder="Minimum 8 characters" className={`${inp} pr-10`} {...passwordForm.register('new_password', { required: true, minLength: 8 })} />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setModal(null)} className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={passwordLoading} className="flex-1 h-11 text-white rounded-xl text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--pl-primary)' }}>
                {passwordLoading ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'theme' && (
        <Modal title="Interface Theme" onClose={() => setModal(null)}>
          <div className="space-y-3">
            {Object.entries(THEMES).map(([key, t]) => (
              <button key={key} onClick={() => handleThemeChange(key)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors text-left"
                style={{ borderColor: currentTheme === key ? t.primary : '#f3f4f6', backgroundColor: currentTheme === key ? t.light : 'white' }}
              >
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.primary }} />
                  <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: t.light }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.primary}</p>
                </div>
                {currentTheme === key && (
                  <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primary }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal === 'category' && (
        <Modal title="Manage Categories" onClose={() => setModal(null)}>
          <form onSubmit={catForm.handleSubmit(onCatSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category name</label>
              <input placeholder="e.g. Groceries" className={inp} {...catForm.register('name', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
              <select className={inp} {...catForm.register('type')}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="both">Both</option>
              </select>
            </div>
            <button type="submit" disabled={createCategory.isPending} className="w-full h-11 text-white rounded-xl text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--pl-primary)' }}>
              {createCategory.isPending ? 'Saving...' : 'Add Category'}
            </button>
          </form>
        </Modal>
      )}

      {modal === 'about' && (
        <Modal title="About PocketLedger" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--pl-light)' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M4 16C4 9.373 9.373 4 16 4s12 5.373 12 12-5.373 12-12 12S4 22.627 4 16z" fill="var(--pl-primary)"/>
                  <path d="M16 9v14M10 13h9a3 3 0 010 6h-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">PocketLedger</p>
                <p className="text-sm text-gray-400">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              PocketLedger is a personal finance tracker built to give you full visibility into your financial patterns. Track income and expenses across multiple currencies, set budgets, and understand where your money goes — all in one place.
            </p>
            <div className="space-y-2">
              {[
                ['Multi-currency support', 'Track transactions in any currency with live conversion'],
                ['Budget tracking', 'Set spending limits per category and monitor usage'],
                ['Financial insights', 'Understand patterns with reports and charts'],
                ['Data privacy', 'Your data is yours — isolated, secure, never hard-deleted'],
              ].map(([title, desc]) => (
                <div key={title} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--pl-light)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--pl-primary)' }}>{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setModal(null)} className="w-full h-11 text-white rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--pl-primary)' }}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
