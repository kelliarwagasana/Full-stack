import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import LoginForm from '../components/LoginForm'
import { getPostLoginPath } from '../authStorage'
import { useAuth } from '../hooks/useAuth'
import type { LoginCredentials } from '../types'

const authImage =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, login, loginWithGoogle } = useAuth()
  const [error, setError] = useState('')

  const submitLogin = (credentials: LoginCredentials) => {
    setError('')

    const result = login(credentials)
    if (!result.success) {
      setError(result.error)
      return
    }

    navigate(getPostLoginPath(result.user))
  }

  const handleDemoLogin = (credentials: LoginCredentials) => {
    submitLogin(credentials)
  }

  const handleGoogleLogin = () => {
    setError('')
    const result = loginWithGoogle()

    if (!result.success) {
      setError(result.error)
      return
    }

    navigate(getPostLoginPath(result.user))
  }

  return (
    <main className="grid h-screen overflow-hidden bg-white text-slate-900 lg:grid-cols-[1.05fr_0.95fr]">
      <div
        className="hidden bg-slate-950 bg-cover bg-center text-white lg:block"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.9), rgba(15,23,42,.35)), url(${authImage})` }}
      >
        <div className="flex h-full flex-col justify-between p-10">
          <div>
            <Link to="/" className="inline-flex items-center text-4xl font-black tracking-tight">
              Air<span className="text-[#ff432e]">bnb</span>
            </Link>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#ff432e]">Secure access</p>
            <h2 className="mt-4 max-w-2xl text-5xl font-black leading-tight tracking-tight">
              Book, host, and manage stays from one account.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80">
              Sign in to continue your trips, saved places, bookings, profile, and hosting dashboard.
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex h-screen items-center justify-center bg-[#f7f3f0] px-4"
      >
        <div className="w-full max-w-md">
          {user ? (
            <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ff432e]">Signed in</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-950">Welcome, {user.name}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your account is active and ready to browse stays.
              </p>
              <Link
                to={getPostLoginPath(user)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff432e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e93623]"
              >
                Continue
                <FiArrowRight />
              </Link>
            </div>
          ) : (
            <>
              <LoginForm
                error={error}
                onSubmit={submitLogin}
                onDemoLogin={handleDemoLogin}
                onGoogleLogin={handleGoogleLogin}
              />
              <p className="mt-3 rounded-full bg-white/90 px-4 py-2.5 text-center text-sm text-slate-700 shadow-lg shadow-slate-950/10 backdrop-blur">
                New here?{' '}
                <Link to="/register" className="font-semibold text-[#ff432e] hover:text-[#c92f20]">
                  Create an account
                </Link>
              </p>
            </>
          )}
          </div>
      </div>
    </main>
  )
}

