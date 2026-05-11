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
    <main className="grid h-screen overflow-hidden bg-white text-black lg:grid-cols-[0.9fr_1.1fr]">
      <div
        className="hidden border-r-2 border-black bg-black bg-cover bg-center text-white lg:block"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.92), rgba(0,0,0,.55)), url(${authImage})` }}
      >
        <div className="flex h-full flex-col justify-between p-10">
          <div>
            <Link to="/" className="inline-flex items-center text-4xl font-black tracking-tight">
              List<span className="text-[#f97316]">On</span>
            </Link>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f97316]">Secure access</p>
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
        className="flex h-screen items-center justify-center bg-white px-4"
      >
        <div className="w-full max-w-md">
          {user ? (
            <div className="border-2 border-black bg-white p-6 shadow-[10px_10px_0_#f97316]">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f97316]">Signed in</p>
              <h1 className="mt-3 text-3xl font-black text-black">Welcome, {user.name}</h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-black/60">
                Your account is active and ready to browse stays.
              </p>
              <Link
                to={getPostLoginPath(user)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 border-2 border-black bg-[#f97316] px-5 py-3 text-sm font-black text-white transition hover:bg-black"
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
              <p className="mt-5 border-2 border-black bg-white px-4 py-2.5 text-center text-sm font-semibold text-black shadow-[5px_5px_0_#f97316]">
                New here?{' '}
                <Link to="/register" className="font-black text-[#f97316] hover:text-black">
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

