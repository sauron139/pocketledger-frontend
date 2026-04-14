import api from './client'

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: (token) => api.post('/auth/refresh', { refresh_token: token }),
}

// Users
export const usersApi = {
  me: () => api.get('/users/me'),
  update: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.patch('/users/me/password', data),
  delete: () => api.delete('/users/me'),
}

// Categories
export const categoriesApi = {
  list: (type) => api.get('/categories/', { params: type ? { type } : {} }),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// Transactions
export const transactionsApi = {
  list: (params) => api.get('/transactions/', { params }),
  create: (data) => api.post('/transactions/', data),
  get: (id) => api.get(`/transactions/${id}`),
  update: (id, data) => api.patch(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
}

// Budgets
export const budgetsApi = {
  list: () => api.get('/budgets/'),
  create: (data) => api.post('/budgets/', data),
  get: (id) => api.get(`/budgets/${id}`),
  update: (id, data) => api.patch(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
}

// Reports
export const reportsApi = {
  summary: (params) => api.get('/reports/summary', { params }),
  byCategory: (params) => api.get('/reports/by-category', { params }),
  trend: (params) => api.get('/reports/trend', { params }),
  budgetStatus: () => api.get('/reports/budget-status'),
}

// Rates
export const ratesApi = {
  current: (from, to) => api.get('/rates/current', { params: { from_currency: from, to_currency: to } }),
}
