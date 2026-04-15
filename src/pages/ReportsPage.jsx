import { useState } from 'react'
import { format, subMonths, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useSummary, useTrend, useCategoryBreakdown, useComparison } from '@/hooks/queries'
import { Skeleton } from '@/components/ui/index'
import { formatCurrency } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { TrendingUp, TrendingDown, PiggyBank, BarChart2 } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

const PRESETS = [
  { label: 'Daily',     value: 'daily',   group_by: 'day',   days: 7 },
  { label: 'Monthly',   value: 'monthly', group_by: 'month', months: 1 },
  { label: '3 Months',  value: '3m',      group_by: 'month', months: 3 },
  { label: '6 Months',  value: '6m',      group_by: 'month', months: 6 },
  { label: '12 Months', value: '12m',     group_by: 'month', months: 12 },
  { label: 'Custom',    value: 'custom',  group_by: 'month' },
]

function getParams(preset, customStart, customEnd) {
  if (preset.value === 'custom' && customStart && customEnd) return { start_date: customStart, end_date: customEnd, group_by: 'month' }
  if (preset.value === 'daily') return { start_date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), end_date: format(new Date(), 'yyyy-MM-dd'), group_by: 'day' }
  const end = endOfMonth(new Date())
  const start = startOfMonth(subMonths(new Date(), (preset.months || 1) - 1))
  return { start_date: format(start, 'yyyy-MM-dd'), end_date: format(end, 'yyyy-MM-dd'), group_by: preset.group_by }
}

export function ReportsPage() {
  usePageTitle('Reports')
  const user = useSelector(selectCurrentUser)
  const [preset, setPreset] = useState(PRESETS[2])
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const currency = user?.base_currency || 'NGN'
  const params = getParams(preset, customStart, customEnd)
  const { data: summary, isLoading: ls } = useSummary(params)
  const { data: trend, isLoading: lt } = useTrend(params)
  const { data: breakdown, isLoading: lb } = useCategoryBreakdown({ ...params, type: 'expense' })
  const { data: comparison } = useComparison('monthly')

  const trendData = trend?.groups?.map(g => ({ name: g.label, Income: parseFloat(g.income), Expenses: parseFloat(g.expense) })) || []
  const pieData = breakdown?.map(b => ({ name: b.category?.name, value: parseFloat(b.total), percentage: b.percentage })) || []

  return (
    <div className="px-5 py-4 space-y-5 max-w-4xl mx-auto">
      <div className="pt-1">
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">Financial Insights</p>
      </div>

      {/* Presets */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRESETS.map(p => (
          <button key={p.value} onClick={() => setPreset(p)}
            className="h-9 px-4 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
            style={{ backgroundColor: preset.value === p.value ? 'var(--pl-primary)' : 'white', color: preset.value === p.value ? 'white' : '#6b7280', border: preset.value === p.value ? 'none' : '1px solid #e5e7eb' }}
          >{p.label}</button>
        ))}
      </div>

      {/* Custom date range */}
      {preset.value === 'custom' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</label>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</label>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
          </div>
        </div>
      )}

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Income', value: summary?.total_income || 0, color: 'text-emerald-600' },
          { label: 'Expenses', value: summary?.total_expense || 0, color: 'text-red-500' },
          { label: 'Net', value: summary?.net_cashflow || 0, color: '' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <p className="text-xs text-gray-500 mb-2">{s.label}</p>
            {ls ? <Skeleton className="h-5 w-full" /> : <p className={`text-sm font-bold ${s.color}`} style={!s.color ? { color: 'var(--pl-primary)' } : {}}>{formatCurrency(s.value, currency)}</p>}
          </div>
        ))}
      </div>

      {/* Net cashflow */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
        <p className="text-sm font-semibold text-gray-700 mb-3">Net Cashflow</p>
        {ls ? <Skeleton className="h-10 w-48 mb-1" /> : <div className="text-3xl font-bold text-gray-900">{formatCurrency(summary?.net_cashflow || 0, currency)}</div>}
        <p className="text-xs text-gray-400 mt-1">For the selected period</p>
      </div>

      {/* vs Last Month comparison */}
      {comparison && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
          <p className="text-sm font-semibold text-gray-700 mb-1">vs Last Month</p>
          <p className="text-xs text-gray-400 mb-4">{comparison.previous_period.start} → {comparison.previous_period.end}</p>
          <div className="grid grid-cols-3 gap-3">
            {['income','expense','net'].map(key => {
              const d = comparison[key]
              const isPositive = Number(d.absolute) >= 0
              const pct = d.percentage
              return (
                <div key={key} className="rounded-2xl p-3" style={{ backgroundColor: 'var(--pl-light)' }}>
                  <p className="text-xs text-gray-500 capitalize mb-1">{key}</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(d.current, currency)}</p>
                  <div className={`flex items-center gap-0.5 mt-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {pct != null ? `${Math.abs(pct)}%` : 'N/A'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Category mix */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
        <p className="text-sm font-semibold text-gray-700 mb-4">Category Mix</p>
        {lb ? <Skeleton className="h-48 w-full" /> : pieData.length === 0
          ? <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No expense data</div>
          : <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => {
                    const colors = ['var(--pl-primary)','var(--pl-mid)','#D4849A','#E8B4BE','#F0D0D8','var(--pl-dark)']
                    return <Cell key={i} fill={colors[i % colors.length]} />
                  })}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v, e) => `${v}  ${e.payload.percentage?.toFixed(0)}%`} />
              </PieChart>
            </ResponsiveContainer>
        }
      </div>

      {/* Revenue vs Expenses line chart */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
        <p className="text-sm font-semibold text-gray-700 mb-4">Revenue vs Expenses</p>
        {lt ? <Skeleton className="h-48 w-full" /> : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatCurrency(v, currency)} />
              <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Expenses" stroke="var(--pl-primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Projected savings */}
      <div className="rounded-3xl p-5 text-white" style={{ backgroundColor: 'var(--pl-primary)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-3"><PiggyBank className="h-5 w-5 text-white" /></div>
        <p className="text-xs tracking-widest opacity-60 uppercase mb-1">Projected Savings</p>
        {ls ? <Skeleton className="h-8 w-32 bg-white/10" /> : <p className="text-2xl font-bold mb-1">{formatCurrency((summary?.net_cashflow || 0) * 3, currency)}</p>}
        <p className="text-xs opacity-60">Based on current cashflow trajectory</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl p-4 border" style={{ backgroundColor: 'var(--pl-light)', borderColor: 'rgba(0,0,0,0.05)' }}>
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center mb-3"><BarChart2 className="h-4 w-4" style={{ color: 'var(--pl-primary)' }} /></div>
          <p className="text-xs text-gray-500 mb-1">Expense Ratio</p>
          {ls ? <Skeleton className="h-6 w-16" /> : <p className="text-xl font-bold text-gray-900">{summary?.total_income ? ((summary.total_expense / summary.total_income) * 100).toFixed(1) : '0'}%</p>}
          <p className="text-xs text-gray-400 mt-1">Of income spent</p>
        </div>
        <div className="rounded-3xl p-4 border" style={{ backgroundColor: 'var(--pl-light)', borderColor: 'rgba(0,0,0,0.05)' }}>
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center mb-3"><TrendingUp className="h-4 w-4" style={{ color: 'var(--pl-primary)' }} /></div>
          <p className="text-xs text-gray-500 mb-1">Net Position</p>
          <p className="text-xl font-bold text-gray-900">{(summary?.net_cashflow || 0) >= 0 ? 'Positive' : 'Negative'}</p>
          <p className="text-xs text-gray-400 mt-1">Asset allocation</p>
        </div>
      </div>
    </div>
  )
}
