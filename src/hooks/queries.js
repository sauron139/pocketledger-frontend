import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  budgetsApi, categoriesApi, reportsApi, transactionsApi, usersApi,
} from '@/api'

// --- User ---
export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => usersApi.me().then(r => r.data.data) })
}

// --- Categories ---
export function useCategories(type) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoriesApi.list(type).then(r => r.data.data),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => categoriesApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

// --- Transactions ---
export function useTransactions(params) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionsApi.list(params).then(r => r.data.data),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => transactionsApi.create(data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => transactionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

// --- Budgets ---
export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.list().then(r => r.data.data),
  })
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => budgetsApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => budgetsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

// --- Reports ---
export function useSummary(params) {
  return useQuery({
    queryKey: ['reports', 'summary', params],
    queryFn: () => reportsApi.summary(params).then(r => r.data.data),
    enabled: !!params.start_date && !!params.end_date,
  })
}

export function useCategoryBreakdown(params) {
  return useQuery({
    queryKey: ['reports', 'by-category', params],
    queryFn: () => reportsApi.byCategory(params).then(r => r.data.data),
    enabled: !!params.start_date && !!params.end_date,
  })
}

export function useTrend(params) {
  return useQuery({
    queryKey: ['reports', 'trend', params],
    queryFn: () => reportsApi.trend(params).then(r => r.data.data),
    enabled: !!params.start_date && !!params.end_date,
  })
}

export function useBudgetStatus() {
  return useQuery({
    queryKey: ['reports', 'budget-status'],
    queryFn: () => reportsApi.budgetStatus().then(r => r.data.data),
  })
}
