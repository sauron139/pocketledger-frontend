import { useSelector } from 'react-redux'
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react'
import { format, startOfMonth, endOfMonth, formatDistanceToNow } from 'date-fns'
import { useSummary, useTransactions, useBudgetStatus } from '@/hooks/queries'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { Skeleton } from '@/components/ui/index'
import { formatCurrency } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'

const now = new Date()
const params = { start_date: format(startOfMonth(now), 'yyyy-MM-dd'), end_date: format(endOfMonth(now), 'yyyy-MM-dd') }

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  usePageTitle('Dashboard')
  const user = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const { data: summary, isLoading: ls } = useSummary(params)
  const { data: txData, isLoading: lt } = useTransactions({ ...params, limit: 6 })
  const { data: budgets } = useBudgetStatus()
  const currency = user?.base_currency || 'NGN'
  const netCashflow = Number(summary?.net_cashflow || 0)
  const isPositive = netCashflow >= 0
  const firstName = user?.first_name || user?.email?.split('@')[0]

  return (
    <div className="px-5 py-4 space-y-5 max-w-2xl mx-auto md:max-w-4xl">
      <div className="pt-1">
        <p className="text-lg font-bold text-gray-900">{getGreeting()}, {firstName}</p>
        <p className="text-sm text-gray-400 mt-0.5">{format(now, 'MMMM yyyy')}</p>
      </div>

      <div className="rounded-3xl p-6 text-white" style={{ backgroundColor: 'var(--pl-primary)' }}>
        <p className="text-xs tracking-widest opacity-70 mb-3 uppercase">Current Net Cashflow</p>
        {ls ? <Skeleton className="h-12 w-40 bg-white/10 mb-3" /> : <div className="text-4xl font-bold tracking-tight mb-3">{formatCurrency(netCashflow, currency)}</div>}
        <div className={`flex items-center gap-1.5 text-sm mb-5 ${isPositive ? 'text-emerald-300' : 'text-red-300'}`}>
          <TrendingUp className="h-4 w-4" />
          <span>{isPositive ? 'Positive' : 'Negative'} cashflow this month</span>
        </div>
        <div className="flex gap-3">
          <Link to="/reports" className="flex-1 h-10 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold flex items-center justify-center transition-colors">View Report</Link>
          <Link to="/transactions" className="flex-1 h-10 border border-white/50 hover:bg-white/10 text-white rounded-xl text-sm font-semibold flex items-center justify-center transition-colors">Add Funds</Link>
        </div>
      </div>

      <button onClick={() => navigate('/transactions?type=income')} className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-50 text-left hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--pl-light)' }}>
            <ArrowDownLeft className="h-5 w-5" style={{ color: 'var(--pl-primary)' }} />
          </div>
          <p className="text-xs tracking-widest text-gray-400 uppercase">Total Income</p>
        </div>
        {ls ? <Skeleton className="h-9 w-36 mb-1" /> : <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(summary?.total_income || 0, currency)}</div>}
        <p className="text-xs text-gray-400">This month</p>
      </button>

      <button onClick={() => navigate('/transactions?type=expense')} className="w-full rounded-3xl p-5 border border-rose-100 text-left hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--pl-light)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5" style={{ color: 'var(--pl-primary)' }} />
          </div>
          <p className="text-xs tracking-widest text-gray-400 uppercase">Total Expenses</p>
        </div>
        {ls ? <Skeleton className="h-9 w-36 mb-1" /> : <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(summary?.total_expense || 0, currency)}</div>}
        {summary && (
          <>
            <div className="h-1 bg-white rounded-full mt-3 mb-1 overflow-hidden">
              <div className="h-full rounded-full" style={{ backgroundColor: 'var(--pl-primary)', width: `${Math.min((summary.total_expense / (summary.total_income || 1)) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400">{((summary.total_expense / (summary.total_income || 1)) * 100).toFixed(0)}% of monthly budget</p>
          </>
        )}
      </button>

      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs font-semibold hover:underline" style={{ color: 'var(--pl-primary)' }}>See All</Link>
        </div>
        <p className="text-xs text-gray-400 mb-4">Your financial history</p>
        {lt
          ? <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
          : txData?.data?.length === 0
            ? <div className="bg-white rounded-2xl p-8 text-center">
                <p className="text-gray-400 text-sm">No transactions yet</p>
                <Link to="/transactions" className="text-xs font-semibold hover:underline mt-1 inline-block" style={{ color: 'var(--pl-primary)' }}>Add your first transaction</Link>
              </div>
            : <div className="space-y-3">
                {txData?.data?.map(tx => (
                  <div key={tx.id} className="bg-white rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm border border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: tx.type === 'income' ? '#ecfdf5' : 'var(--pl-light)', color: tx.type === 'income' ? '#065f46' : 'var(--pl-primary)' }}>
                        {tx.category?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tx.category?.name}</p>
                        <p className="text-xs text-gray-400">{tx.type} · {formatDistanceToNow(new Date(tx.transaction_date), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount_in_base, currency)}
                    </p>
                  </div>
                ))}
              </div>
        }
      </div>

      {budgets && budgets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Budget Status</h2>
            <Link to="/budgets" className="text-xs font-semibold hover:underline" style={{ color: 'var(--pl-primary)' }}>View All</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-50 shadow-sm p-5 space-y-4">
            {budgets.slice(0, 4).map(b => {
              const pct = b.utilisation?.percentage || 0
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-800">{b.category?.name}</p>
                    <p className="text-xs text-gray-500">{pct.toFixed(0)}%</p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : 'var(--pl-primary)' }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatCurrency(b.utilisation?.spent || 0, currency)} of {formatCurrency(b.amount, currency)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
