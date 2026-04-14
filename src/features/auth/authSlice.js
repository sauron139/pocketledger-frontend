import { createSlice } from '@reduxjs/toolkit'

const access = localStorage.getItem('access_token')
const stored = localStorage.getItem('user')

const initialState = {
  user: stored ? JSON.parse(stored) : null,
  accessToken: access || null,
  isAuthenticated: !!access,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }) {
      state.user = payload.user
      state.accessToken = payload.access_token
      state.isAuthenticated = true
      localStorage.setItem('access_token', payload.access_token)
      localStorage.setItem('refresh_token', payload.refresh_token)
      localStorage.setItem('user', JSON.stringify(payload.user))
    },
    clearCredentials(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    },
    updateUser(state, { payload }) {
      state.user = { ...state.user, ...payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
})

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
