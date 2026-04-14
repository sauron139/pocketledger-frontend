import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Plus, X, Trash2, Target } from 'lucide-react'
import { useBudgets, useCreateBudget, useDeleteBudget, useCategories } from '@/hooks/queries'
import { Skeleton } from '@/components/ui/index'
import { formatCurrency } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useToastContext } from '@/components/ToastProvider'
import { usePageTitle } from '@/hooks/usePageTitle'

function BudgetForm({ onClose }) {
  const toast = useToastContext()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { period: 'monthly', currency: 'NGN', is_recurring: true, start_date: format(new Date(), 'yyyy-MM-dd') },
  })
  const { data: categories } = useCategories('expense')
  const createBudget = useCreateBudget()
  const inp = "w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"

  async function onSubmit(data) {
    try {
      await createBudget.mutateAsync({ ...data, amount: parseFloat(data.amount) })
      toast({ message: 'Budget created successfully', type: 'success' })
      onClose()
    } catch (e) {
      toast({ message: e.response?.data?.message || 'Failed to create budget', type: 'error' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: 'var(--pl-primary)' }}>
          <div>
            <h2 className="text-white font-bold text-lg">New budget</h2>
            <p className="text-white/60 text-xs mt-0.5">Set a spending limit</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
              <select className={inp} {...register('category_id', { required: true })}>
                <option value="">Select a category</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-xs text-red-500">Category required</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</label>
                <input type="number" step="0.01" placeholder="0.00" className={inp} {...register('amount', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Currency</label>
                <select className={inp} {...register('currency')}>{['NGN','USD','EUR','GBP'].map(c => <option key={c}>{c}</option>)}</select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Period</label>
                <select className={inp} {...register('period')}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start date</label>
                <input type="date" className={inp} {...register('start_date', { required: true })} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={createBudget.isPending} className="flex-1 h-11 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60" style={{ backgroundColor: 'var(--pl-primary)' }}>
                {createBudget.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export function BudgetsPage() {
  usePageTitle('Budgets')
  const toast = useToastContext()
  const user = useSelector(selectCurrentUser)
  const [showForm, setShowForm] = useState(false)
  const { data: budgets, isLoading } = useBudgets()
  const deleteBudget = useDeleteBudget()
  const currency = user?.base_currency || 'NGN'
  const totalBudget = budgets?.reduce((s, b) => s + Number(b.amount), 0) || 0
  const totalSpent = budgets?.reduce((s, b) => s + Number(b.utilisation?.spent || 0), 0) || 0
  const overallPct = totalBudget ? (totalSpent / totalBudget * 100) : 0

  async function handleDelete(id) {
    try { await deleteBudget.mutateAsync(id); toast({ message: 'Budget deleted', type: 'success' }) }
    catch (e) { toast({ message: e.response?.data?.message || 'Failed to delete budget', type: 'error' }) }
  }

  return (
    <div className="px-5 py-4 space-y-5 max-w-4xl mx-auto">
      {!isLoading && budgets && budgets.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Remaining</p>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--pl-light)' }}>
              <Target className="h-4 w-4" style={{ color: 'var(--pl-primary)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-3">{formatCurrency(totalBudget - totalSpent, currency)}</div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div className="h-full rounded-full" style={{ width: `${Math.min(overallPct, 100)}%`, backgroundColor: 'var(--pl-primary)' }} />
          </div>
          <p className="text-xs text-gray-400">{overallPct.toFixed(0)}% of your total budget used this month</p>
        </div>
      )}

      {isLoading
        ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}</div>
        : budgets?.length === 0
          ? <div className="bg-white rounded-3xl border border-gray-50 shadow-sm text-center py-16">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--pl-light)' }}>
                <Target className="h-5 w-5" style={{ color: 'var(--pl-primary)' }} />
              </div>
              <p className="text-gray-500 text-sm font-medium">No budgets yet</p>
              <p className="text-gray-400 text-xs mt-1">Tap + to add your first budget</p>
            </div>
          : <div className="space-y-3">
              {budgets?.map((b, idx) => {
                const pct = b.utilisation?.percentage || 0
                const isFeatured = idx === 1
                const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : isFeatured ? 'rgba(255,255,255,0.4)' : 'var(--pl-primary)'
                return (
                  <div key={b.id} className="rounded-3xl p-5" style={{ backgroundColor: isFeatured ? 'var(--pl-primary)' : 'white', border: isFeatured ? 'none' : '1px solid #f9fafb', boxShadow: isFeatured ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: isFeatured ? 'rgba(255,255,255,0.2)' : 'var(--pl-light)' }}>
                          <Target className="h-5 w-5" style={{ color: isFeatured ? 'white' : 'var(--pl-primary)' }} />
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: isFeatured ? 'white' : '#111827' }}>{b.category?.name}</p>
                          <p className="text-xs capitalize" style={{ color: isFeatured ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>{b.period}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pct >= 70 && !isFeatured && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--pl-light)', color: 'var(--pl-primary)' }}>Priority</span>}
                        <button onClick={() => handleDelete(b.id)} className="text-gray-200 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-xs mb-1" style={{ color: isFeatured ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>SPENT</p>
                        <p className="text-2xl font-bold" style={{ color: isFeatured ? 'white' : '#111827' }}>{formatCurrency(b.utilisation?.spent || 0, currency)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs mb-1" style={{ color: isFeatured ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>LIMIT</p>
                        <p className="text-sm font-semibold" style={{ color: isFeatured ? 'rgba(255,255,255,0.8)' : '#6b7280' }}>{formatCurrency(b.amount, currency)}</p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: isFeatured ? 'rgba(255,255,255,0.2)' : '#f3f4f6' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs" style={{ color: isFeatured ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>{pct.toFixed(0)}% utilized</p>
                      <p className="text-xs" style={{ color: isFeatured ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>{formatCurrency(b.utilisation?.remaining || 0, currency)} left</p>
                    </div>
                  </div>
                )
              })}
            </div>
      }

      <button onClick={() => setShowForm(true)} className="fixed bottom-24 right-5 md:bottom-8 w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center transition-colors z-10" style={{ backgroundColor: 'var(--pl-primary)' }}>
        <Plus className="h-6 w-6" />
      </button>

      {showForm && <BudgetForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
