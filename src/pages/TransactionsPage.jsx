import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Plus, Trash2, X, Search, SlidersHorizontal, ChevronDown, Download } from 'lucide-react'
import { useTransactions, useCreateTransaction, useDeleteTransaction, useCategories } from '@/hooks/queries'
import { exportsApi } from '@/api'
import { Skeleton } from '@/components/ui/index'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useToastContext } from '@/components/ToastProvider'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'

function TransactionForm({ onClose }) {
  const toast = useToastContext()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { transaction_date: format(new Date(), 'yyyy-MM-dd'), currency: 'NGN', type: 'expense' },
  })
  const selectedType = watch('type')
  const { data: allCategories } = useCategories()
  const categories = allCategories?.filter(c =>
    selectedType === 'income' ? (c.type === 'income' || c.type === 'both') : (c.type === 'expense' || c.type === 'both')
  )
  const createTx = useCreateTransaction()
  const inp = "w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"

  async function onSubmit(data) {
    try {
      await createTx.mutateAsync({ ...data, amount: parseFloat(data.amount) })
      toast({ message: 'Transaction added successfully', type: 'success' })
      onClose()
    } catch (e) {
      toast({ message: e.response?.data?.message || 'Failed to save transaction', type: 'error' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: 'var(--pl-primary)' }}>
          <div>
            <h2 className="text-white font-bold text-lg">New transaction</h2>
            <p className="text-white/60 text-xs mt-0.5">Record an income or expense</p>
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Currency</label>
                <select className={inp} {...register('currency')}>{['NGN','USD','EUR','GBP','USDT'].map(c => <option key={c}>{c}</option>)}</select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</label>
              <input type="number" step="0.01" placeholder="0.00" className={inp} {...register('amount', { required: true, min: 0.01 })} />
              {errors.amount && <p className="text-xs text-red-500">Valid amount required</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Category <span className="normal-case font-normal text-gray-400">({selectedType} categories)</span>
              </label>
              <select className={inp} {...register('category_id', { required: true })}>
                <option value="">Select a category</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-xs text-red-500">Category required</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
              <input type="date" className={inp} {...register('transaction_date', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description <span className="normal-case font-normal text-gray-400">(optional)</span></label>
              <input placeholder="What was this for?" className={inp} {...register('description')} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={createTx.isPending} className="flex-1 h-11 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60" style={{ backgroundColor: 'var(--pl-primary)' }}>
                {createTx.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export function TransactionsPage() {
  usePageTitle('Transactions')
  const toast = useToastContext()
  const user = useSelector(selectCurrentUser)
  const [searchParams] = useSearchParams()
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [activeFilter, setActiveFilter] = useState(searchParams.get('type') || 'all')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filters, setFilters] = useState({ page: 1, limit: 20, type: searchParams.get('type') || undefined })
  const { data, isLoading } = useTransactions(filters)
  const deleteTx = useDeleteTransaction()
  const { data: allCategories } = useCategories()
  const currency = user?.base_currency || 'NGN'

  useEffect(() => {
    const t = searchParams.get('type')
    if (t) { setActiveFilter(t); setFilters(f => ({ ...f, type: t })) }
  }, [searchParams])

  function setTypeFilter(type) {
    setActiveFilter(type)
    setFilters(f => ({ ...f, type: type === 'all' ? undefined : type, category_id: undefined }))
    setSelectedCategory('')
  }

  async function handleExport() {
    setExporting(true)
    try {
      const res = await exportsApi.transactions({
        type: filters.type,
        start_date: filters.start_date,
        end_date: filters.end_date,
      })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `pocketledger-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast({ message: 'Export downloaded', type: 'success' })
    } catch {
      toast({ message: 'Export failed', type: 'error' })
    } finally { setExporting(false) }
  }

  async function handleDelete(id) {
    try { await deleteTx.mutateAsync(id); toast({ message: 'Transaction deleted', type: 'success' }) }
    catch { toast({ message: 'Failed to delete transaction', type: 'error' }) }
  }

  const pillCls = (active) => cn('h-9 px-4 rounded-full text-sm font-semibold transition-colors whitespace-nowrap', active ? 'text-white' : 'bg-white text-gray-600 border border-gray-200')
  const grouped = data?.data?.reduce((acc, tx) => { const k = tx.transaction_date; if (!acc[k]) acc[k] = []; acc[k].push(tx); return acc }, {}) || {}

  return (
    <div className="px-5 py-4 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-gray-400">{data?.total || 0} total records</p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60"
          style={{ backgroundColor: 'var(--pl-light)', color: 'var(--pl-primary)' }}
        >
          <Download className="h-3.5 w-3.5" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input placeholder="Search transactions, vendors, or categories..." className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-gray-100 text-sm focus:outline-none shadow-sm" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all','expense','income'].map(f => (
          <button key={f} onClick={() => setTypeFilter(f)} className={pillCls(activeFilter === f)} style={activeFilter === f ? { backgroundColor: 'var(--pl-primary)' } : {}}>
            {f === 'all' ? 'All Time' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
          </button>
        ))}
        <button onClick={() => setShowFilters(!showFilters)} className={cn(pillCls(showFilters), 'flex items-center gap-1.5')} style={showFilters ? { backgroundColor: 'var(--pl-primary)' } : {}}>
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters <ChevronDown className={cn("h-3 w-3 transition-transform", showFilters && "rotate-180")} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter by category</label>
            <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setFilters(f => ({ ...f, category_id: e.target.value || undefined })) }} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none">
              <option value="">All categories</option>
              {allCategories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</label>
              <input type="date" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none" onChange={e => setFilters(f => ({ ...f, start_date: e.target.value || undefined }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</label>
              <input type="date" className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none" onChange={e => setFilters(f => ({ ...f, end_date: e.target.value || undefined }))} />
            </div>
          </div>
        </div>
      )}

      {isLoading
        ? <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
        : data?.data?.length === 0
          ? <div className="text-center py-16"><p className="text-gray-400 text-sm">No transactions found</p></div>
          : <div className="space-y-5">
              {Object.entries(grouped).map(([date, txs]) => (
                <div key={date}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{formatDate(date)}</p>
                    <p className="text-xs text-gray-400">{txs.length} Transaction{txs.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="space-y-3">
                    {txs.map(tx => (
                      <div key={tx.id} className="bg-white rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm border border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: tx.type === 'income' ? '#ecfdf5' : 'var(--pl-light)', color: tx.type === 'income' ? '#065f46' : 'var(--pl-primary)' }}>
                            {tx.category?.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-gray-900">{tx.category?.name}</p>
                              {tx.source === 'recurring' && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">Auto</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">{tx.description || tx.category?.name} · {tx.transaction_date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount_in_base, currency)}
                            </p>
                            {tx.currency !== currency && <p className="text-xs text-gray-400">{tx.currency} {tx.amount}</p>}
                          </div>
                          <button onClick={() => handleDelete(tx.id)} className="text-gray-200 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
      }

      <button onClick={() => setShowForm(true)} className="fixed bottom-24 right-5 md:bottom-8 w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center transition-colors z-10" style={{ backgroundColor: 'var(--pl-primary)' }}>
        <Plus className="h-6 w-6" />
      </button>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
