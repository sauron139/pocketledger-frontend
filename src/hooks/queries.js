import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  transactionsApi, categoriesApi, budgetsApi, reportsApi,
  notificationsApi, recurringApi, exportsApi,
} from '@/api'

// ── Transactions ──────────────────────────────────────────────
export const useTransactions = (params) =>
  useQuery({ queryKey: ['transactions', params], queryFn: () => transactionsApi.list(params).then(r => r.data.data) })

export const useCreateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: data => transactionsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export const useDeleteTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => transactionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

// ── Categories ────────────────────────────────────────────────
export const useCategories = (type) =>
  useQuery({ queryKey: ['categories', type], queryFn: () => categoriesApi.list(type).then(r => r.data.data) })

export const useCreateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: data => categoriesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export const useDeleteCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

// ── Budgets ───────────────────────────────────────────────────
export const useBudgets = () =>
  useQuery({ queryKey: ['budgets'], queryFn: () => budgetsApi.list().then(r => r.data.data) })

export const useCreateBudget = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: data => budgetsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export const useDeleteBudget = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => budgetsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

// ── Reports ───────────────────────────────────────────────────
export const useSummary = (params) =>
  useQuery({ queryKey: ['summary', params], queryFn: () => reportsApi.summary(params).then(r => r.data.data), enabled: !!params.start_date })

export const useTrend = (params) =>
  useQuery({ queryKey: ['trend', params], queryFn: () => reportsApi.trend(params).then(r => r.data.data), enabled: !!params.start_date })

export const useCategoryBreakdown = (params) =>
  useQuery({ queryKey: ['category-breakdown', params], queryFn: () => reportsApi.byCategory(params).then(r => r.data.data), enabled: !!params.start_date })

export const useBudgetStatus = () =>
  useQuery({ queryKey: ['budget-status'], queryFn: () => reportsApi.budgetStatus().then(r => r.data.data) })

export const useComparison = (period) =>
  useQuery({ queryKey: ['comparison', period], queryFn: () => reportsApi.comparison(period).then(r => r.data.data) })

// ── Notifications ─────────────────────────────────────────────
export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: () => notificationsApi.list().then(r => r.data.data), refetchInterval: 30000 })

export const useMarkNotificationRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

// ── Recurring ─────────────────────────────────────────────────
export const useRecurring = () =>
  useQuery({ queryKey: ['recurring'], queryFn: () => recurringApi.list().then(r => r.data.data) })

export const useCreateRecurring = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: data => recurringApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}

export const useDeleteRecurring = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => recurringApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}

export const useToggleRecurring = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }) => recurringApi.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}
