import { Trash2, Tag } from 'lucide-react'
import { useCategories, useDeleteCategory } from '@/hooks/queries'
import { Skeleton } from '@/components/ui/index'
import { useToastContext } from '@/components/ToastProvider'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Link } from 'react-router-dom'

function CategoryGroup({ title, categories, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
      </div>
      <div className="divide-y divide-gray-50">
        {categories.length === 0
          ? <p className="text-sm text-gray-400 px-5 py-4">None yet</p>
          : categories.map(c => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3.5 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--pl-light)' }}>
                  <Tag className="h-4 w-4" style={{ color: 'var(--pl-primary)' }} />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  {c.is_default && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">default</span>}
                </div>
              </div>
              <button onClick={() => onDelete(c.id)} className="text-gray-200 hover:text-red-400 transition-colors p-1">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export function CategoriesPage() {
  usePageTitle('Categories')
  const toast = useToastContext()
  const { data: categories, isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()

  async function handleDelete(id) {
    try { await deleteCategory.mutateAsync(id); toast({ message: 'Category deleted', type: 'success' }) }
    catch (e) { toast({ message: e.response?.data?.message || 'Cannot delete — has linked transactions or budgets', type: 'error' }) }
  }

  const income = categories?.filter(c => c.type === 'income') || []
  const expense = categories?.filter(c => c.type === 'expense') || []
  const both = categories?.filter(c => c.type === 'both') || []

  return (
    <div className="px-5 py-4 space-y-5 max-w-3xl mx-auto">
      <div className="pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Categories</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          To add categories, go to{' '}
          <Link to="/settings" className="font-semibold hover:underline" style={{ color: 'var(--pl-primary)' }}>
            Settings → Manage Categories
          </Link>
        </p>
      </div>
      {isLoading
        ? <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}</div>
        : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategoryGroup title="Expense categories" categories={expense} onDelete={handleDelete} />
            <CategoryGroup title="Income categories" categories={income} onDelete={handleDelete} />
            {both.length > 0 && <CategoryGroup title="Both" categories={both} onDelete={handleDelete} />}
          </div>
      }
    </div>
  )
}
