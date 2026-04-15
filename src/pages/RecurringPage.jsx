import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Plus, X, Trash2, RefreshCw, Pause, Play } from 'lucide-react'
import { useRecurring, useCreateRecurring, useDeleteRecurring, useToggleRecurring, useCategories } from '@/hooks/queries'
import { Skeleton } from '@/components/ui/index'
import { formatCurrency } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useToastContext } from '@/components/ToastProvider'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/utils'

const FREQUENCIES = ['daily', 'weekly', 'monthly']

function RecurringForm({ onClose }) {
  const toast = useToastContext()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'expense', currency: 'NGN', frequency: 'monthly', next_run_date: format(new Date(), 'yyyy-MM-dd'), is_active: true },
  })
  const selectedType = watch('type')
  const { data: allCategories } = useCategories()
  const categories = allCategories?.filter(c =>
    selectedType === 'income' ? (c.type === 'income' || c.type === 'both') : (c.type === 'expense' || c.type === 'both')
  )
  const createRecurring = useCreateRecurring()
  const inp = "w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"

  async function onSubmit(data) {
    try {
      await createRecurring.mutateAsync({
        ...data,
        amount: parseFloat(data.amount),
        end_date: data.end_date || undefined,
      })
      toast({ message: 'Recurring transaction created', type: 'success' })
      onClose()
    } catch (e) {
      toast({ message: e.response?.data?.message || 'Failed to create', type: 'error' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: 'var(--pl-primary)' }}>
          <div>
            <h2 className="text-white font-bold text-lg">New recurring transaction</h2>
            <p className="text-white/60 text-xs mt-0.5">Set up automatic recurring entries</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
                <select className={inp} {...register('type')}><option value="expense">Expense</option><option value="income">Income</option></select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Frequency</label>
                <select className={inp} {...register('frequency')}>
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</label>
                <input type="number" step="0.01" placeholder="0.00" className={inp} {...register('amount', { required: true, min: 0.01 })} />
                {errors.amount && <p className="text-xs text-red-500">Required</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Currency</label>
                <select className={inp} {...register('currency')}>{['NGN','USD','EUR','GBP'].map(c => <option key={c}>{c}</option>)}</select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
              <select className={inp} {...register('category_id', { required: true })}>
                <option value="">Select category</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-xs text-red-500">Required</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First run date</label>
                <input type="date" className={inp} {...register('next_run_date', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End date <span className="normal-case font-normal text-gray-400">(opt)</span></label>
                <input type="date" className={inp} {...register('end_date')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
              <input placeholder="e.g. Monthly Netflix" className={inp} {...register('description')} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={createRecurring.isPending} className="flex-1 h-11 text-white rounded-xl text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--pl-primary)' }}>
                {createRecurring.isPending ? 'Saving...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const FREQ_LABELS = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }

export function RecurringPage() {
  usePageTitle('Recurring')
  const toast = useToastContext()
  const user = useSelector(selectCurrentUser)
  const [showForm, setShowForm] = useState(false)
  const { data: recurring, isLoading } = useRecurring()
  const deleteRecurring = useDeleteRecurring()
  const toggleRecurring = useToggleRecurring()
  const currency = user?.base_currency || 'NGN'

  async function handleDelete(id) {
    try { await deleteRecurring.mutateAsync(id); toast({ message: 'Deleted', type: 'success' }) }
    catch { toast({ message: 'Failed to delete', type: 'error' }) }
  }

  async function handleToggle(id, is_active) {
    try {
      await toggleRecurring.mutateAsync({ id, is_active: !is_active })
      toast({ message: is_active ? 'Paused' : 'Resumed', type: 'success' })
    } catch { toast({ message: 'Failed to update', type: 'error' }) }
  }

  return (
    <div className="px-5 py-4 space-y-5 max-w-4xl mx-auto">
      <div className="pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Recurring</h1>
        <p className="text-sm text-gray-400 mt-0.5">Transactions that run automatically on a schedule</p>
      </div>

      {isLoading
        ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
        : recurring?.length === 0
          ? <div className="bg-white rounded-2xl border border-gray-50 shadow-sm text-center py-16">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--pl-light)' }}>
                <RefreshCw className="h-5 w-5" style={{ color: 'var(--pl-primary)' }} />
              </div>
              <p className="text-gray-500 text-sm font-medium">No recurring transactions</p>
              <p className="text-gray-400 text-xs mt-1">Tap + to set up automatic entries</p>
            </div>
          : <div className="space-y-3">
              {recurring?.map(r => (
                <div key={r.id} className={cn('bg-white rounded-2xl p-5 shadow-sm border border-gray-50 transition-opacity', !r.is_active && 'opacity-60')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--pl-light)' }}>
                        <RefreshCw className="h-4 w-4" style={{ color: 'var(--pl-primary)' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{r.category?.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.type === 'income' ? 'bg-emerald-50 text-emerald-700' : ''}`}
                            style={r.type !== 'income' ? { backgroundColor: 'var(--pl-light)', color: 'var(--pl-primary)' } : {}}
                          >{r.type}</span>
                          {!r.is_active && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">Paused</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{r.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${r.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount, r.currency)}
                      </p>
                      <p className="text-xs text-gray-400">{r.currency}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="px-2 py-1 rounded-lg bg-gray-50 font-medium">{FREQ_LABELS[r.frequency]}</span>
                      <span>Next: {r.next_run_date}</span>
                      {r.end_date && <span>Ends: {r.end_date}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(r.id, r.is_active)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                        style={{ backgroundColor: 'var(--pl-light)' }}
                      >
                        {r.is_active
                          ? <Pause className="h-3.5 w-3.5" style={{ color: 'var(--pl-primary)' }} />
                          : <Play className="h-3.5 w-3.5" style={{ color: 'var(--pl-primary)' }} />
                        }
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors">
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      }

      <button onClick={() => setShowForm(true)} className="fixed bottom-24 right-5 md:bottom-8 w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center transition-colors z-10" style={{ backgroundColor: 'var(--pl-primary)' }}>
        <Plus className="h-6 w-6" />
      </button>

      {showForm && <RecurringForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
