import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { store } from '@/app/store'
import { clearCredentials, setCredentials } from '@/features/auth/authSlice'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const client = axios.create({ baseURL: `${API_URL}/api/v1` })

// Attach token
client.interceptors.request.use(config => {
  const token = store.getState().auth.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresh on 401, handle 429
client.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = store.getState().auth.refreshToken
        const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refresh_token: refreshToken })
        store.dispatch(setCredentials({ ...store.getState().auth.user, ...res.data.data }))
        original.headers.Authorization = `Bearer ${res.data.data.access_token}`
        return client(original)
      } catch {
        store.dispatch(clearCredentials())
        window.location.href = '/login'
      }
    }
    if (error.response?.status === 429) {
      error.message = 'Too many requests — please slow down'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: data => client.post('/auth/register', data),
  login: data => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  refresh: token => client.post('/auth/refresh', { refresh_token: token }),
}

// ── Users ─────────────────────────────────────────────────────
export const usersApi = {
  me: () => client.get('/users/me'),
  update: data => client.patch('/users/me', data),
  changePassword: data => client.patch('/users/me/password', data),
  delete: () => client.delete('/users/me'),
}

// ── Categories ────────────────────────────────────────────────
export const categoriesApi = {
  list: (type) => client.get('/categories/', { params: type ? { type } : {} }),
  create: data => client.post('/categories/', data),
  update: (id, data) => client.patch(`/categories/${id}`, data),
  delete: id => client.delete(`/categories/${id}`),
}

// ── Transactions ──────────────────────────────────────────────
export const transactionsApi = {
  list: params => client.get('/transactions/', { params }),
  // Idempotency-Key is REQUIRED by the backend on every create
  create: data => client.post('/transactions/', data, {
    headers: { 'Idempotency-Key': uuidv4() }
  }),
  get: id => client.get(`/transactions/${id}`),
  update: (id, data) => client.patch(`/transactions/${id}`, data),
  delete: id => client.delete(`/transactions/${id}`),
}

// ── Budgets ───────────────────────────────────────────────────
export const budgetsApi = {
  list: () => client.get('/budgets/'),
  create: data => client.post('/budgets/', data),
  get: id => client.get(`/budgets/${id}`),
  update: (id, data) => client.patch(`/budgets/${id}`, data),
  delete: id => client.delete(`/budgets/${id}`),
}

// ── Reports ───────────────────────────────────────────────────
export const reportsApi = {
  summary: params => client.get('/reports/summary', { params }),
  byCategory: params => client.get('/reports/by-category', { params }),
  trend: params => client.get('/reports/trend', { params }),
  budgetStatus: () => client.get('/reports/budget-status'),
  comparison: (period = 'monthly') => client.get('/reports/comparison', { params: { period } }),
}

// ── Rates ─────────────────────────────────────────────────────
export const ratesApi = {
  getCurrent: (from_currency, to_currency) =>
    client.get('/rates/current', { params: { from_currency, to_currency } }),
}

// ── Notifications ─────────────────────────────────────────────
export const notificationsApi = {
  list: () => client.get('/notifications/'),
  markRead: id => client.patch(`/notifications/${id}/read`),
}

// ── Recurring transactions ────────────────────────────────────
export const recurringApi = {
  list: () => client.get('/recurring/'),
  create: data => client.post('/recurring/', data),
  update: (id, data) => client.patch(`/recurring/${id}`, data),
  delete: id => client.delete(`/recurring/${id}`),
}

// ── Exports ───────────────────────────────────────────────────
export const exportsApi = {
  transactions: (params = {}) =>
    client.get('/exports/transactions', { params, responseType: 'blob' }),
}
