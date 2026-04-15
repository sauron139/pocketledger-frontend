import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { useNotifications, useMarkNotificationRead } from '@/hooks/queries'
import { formatDistanceToNow } from 'date-fns'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationRead()
  const unread = notifications.filter(n => !n.is_read)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleMarkRead(id) {
    markRead.mutate(id)
  }

  function handleMarkAll() {
    unread.forEach(n => markRead.mutate(n.id))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{ backgroundColor: 'var(--pl-light)', border: '1.5px solid var(--pl-primary)' }}
      >
        <Bell className="h-4 w-4" style={{ color: 'var(--pl-primary)' }} />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: 'var(--pl-primary)' }}>
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-900">Notifications</p>
            <div className="flex items-center gap-2">
              {unread.length > 0 && (
                <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--pl-primary)' }}>
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0
              ? <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications</div>
              : notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 flex items-start gap-3 transition-colors ${!n.is_read ? 'bg-rose-50/50' : ''}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: n.percentage >= 100 ? '#fef2f2' : 'var(--pl-light)' }}>
                    <Bell className="h-3.5 w-3.5" style={{ color: n.percentage >= 100 ? '#ef4444' : 'var(--pl-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      {n.percentage >= 100 ? 'Budget exceeded' : 'Budget alert'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {n.percentage.toFixed(0)}% of budget used
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-1">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
