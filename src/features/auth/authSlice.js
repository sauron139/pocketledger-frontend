import { createSlice } from '@reduxjs/toolkit'

const stored = (() => {
  try { return JSON.parse(localStorage.getItem('pl_auth') || 'null') } catch { return null }
})()

const initialState = {
  user: stored?.user || null,
  accessToken: stored?.accessToken || null,
  refreshToken: stored?.refreshToken || null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, access_token, refresh_token } = action.payload
      state.user = user
      state.accessToken = access_token
      state.refreshToken = refresh_token
      localStorage.setItem('pl_auth', JSON.stringify({
        user,
        accessToken: access_token,
        refreshToken: refresh_token,
      }))
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      const stored = JSON.parse(localStorage.getItem('pl_auth') || '{}')
      localStorage.setItem('pl_auth', JSON.stringify({ ...stored, user: state.user }))
    },
    clearCredentials(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      localStorage.removeItem('pl_auth')
    },
  },
})

export const { setCredentials, updateUser, clearCredentials } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = state => state.auth.user
