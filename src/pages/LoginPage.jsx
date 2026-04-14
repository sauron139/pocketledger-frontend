import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { authApi } from '@/api'
import { setCredentials } from '@/features/auth/authSlice'
import { AuthLayout } from '@/layouts/AuthLayout'
import { usePageTitle } from '@/hooks/usePageTitle'

export function LoginPage() {
  usePageTitle('Login')
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function onSubmit(data) {
    setLoading(true); setError('')
    try {
      const res = await authApi.login(data)
      dispatch(setCredentials(res.data.data))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const inp = "w-full h-11 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white"

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5" style={{ backgroundColor: 'var(--pl-primary)' }}>
          <h2 className="text-white font-bold text-xl">Welcome back</h2>
          <p className="text-white/60 text-sm mt-0.5">Sign in to continue</p>
        </div>
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" placeholder="you@example.com" className={`${inp} pl-10 pr-4`} {...register('email', { required: true })} />
              </div>
              {errors.email && <p className="text-xs text-red-500">Email is required</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className={`${inp} pl-10 pr-10`} {...register('password', { required: true })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">Password is required</p>}
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="w-full h-11 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60" style={{ backgroundColor: 'var(--pl-primary)' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--pl-primary)' }}>Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
