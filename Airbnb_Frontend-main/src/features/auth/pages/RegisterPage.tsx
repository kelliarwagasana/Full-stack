import { type ChangeEvent, type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FiArrowRight, FiBriefcase, FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi'
import { getPostLoginPath } from '../authStorage'
import { useAuth } from '../hooks/useAuth'
import type { RegisterCredentials, RegisterRole } from '../types'

const initialForm: RegisterCredentials = {
  name: '',
  email: '',
  username: '',
  phone: '',
  password: '',
  role: 'GUEST',
}

const authImage =
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loginWithGoogle } = useAuth()
  const [form, setForm] = useState<RegisterCredentials>(initialForm)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const field = event.target.name as keyof RegisterCredentials
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleRoleChange = (role: RegisterRole) => {
    setForm((current) => ({ ...current, role }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const result = register(form)

    if (!result.success) {
      setError(result.error)
      return
    }

    navigate(getPostLoginPath(result.user))
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
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f97316]">Your account</p>
            <h2 className="mt-4 max-w-2xl text-5xl font-black leading-tight tracking-tight">
              Start exploring better stays with a personal profile.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80">
              Create an account to save places, post reviews, update your profile, and manage every trip.
            </p>
          </div>
        </div>
      </div>

      <div
        className="h-screen overflow-y-auto bg-white px-4 py-6"
      >
        <div className="mx-auto flex min-h-full w-full max-w-lg items-center">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden border-2 border-black bg-white p-5 shadow-[10px_10px_0_#f97316]"
          >
            <div className="absolute right-[-4rem] top-[-4rem] h-36 w-36 border-2 border-black bg-[#fff7ed]" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#f97316]">Create account</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-black">Join ListOn today</h1>
              <p className="mt-2 text-sm font-semibold leading-5 text-black/55">
                Start as a guest, save favorites, post reviews, and manage bookings from your profile.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 border-2 border-black bg-white p-1">
                {[
                  { role: 'GUEST' as const, label: 'Sign up as guest', icon: FiUser },
                  { role: 'HOST' as const, label: 'Sign up as host', icon: FiBriefcase },
                ].map((option) => {
                  const Icon = option.icon
                  const isSelected = form.role === option.role

                  return (
                    <button
                      key={option.role}
                      type="button"
                      onClick={() => handleRoleChange(option.role)}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                        isSelected
                          ? 'bg-[#f97316] text-white'
                          : 'bg-transparent text-black/60 hover:bg-[#fff7ed] hover:text-black'
                      }`}
                    >
                      <Icon />
                      {option.label}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-4 flex w-full items-center justify-center gap-3 border-2 border-black bg-white px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#fff7ed]"
              >
                <FcGoogle className="text-xl" />
                Continue with Google
              </button>

              <div className="my-4 flex items-center gap-3">
                <span className="h-0.5 flex-1 bg-black" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-black/45">or register</span>
                <span className="h-0.5 flex-1 bg-black" />
              </div>

              {error && (
                <p className="border-2 border-[#f97316] bg-[#fff7ed] px-4 py-3 text-sm font-bold text-black">
                  {error}
                </p>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Full name</span>
                  <span className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-[#f97316] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f97316]/10">
                    <FiUser className="text-slate-400" />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                      placeholder="Your full name"
                      className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      required
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Username</span>
                  <span className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-[#f97316] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f97316]/10">
                    <FiUser className="text-slate-400" />
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      autoComplete="username"
                      placeholder="username"
                      className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      required
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Phone</span>
                  <span className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-[#f97316] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f97316]/10">
                    <FiPhone className="text-slate-400" />
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      placeholder="+1 555 0100"
                      className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      required
                    />
                  </span>
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Email address</span>
                  <span className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-[#f97316] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f97316]/10">
                    <FiMail className="text-slate-400" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="name@example.com"
                      className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      required
                    />
                  </span>
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Password</span>
                  <span className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-[#f97316] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f97316]/10">
                    <FiLock className="text-slate-400" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="text-slate-400 transition hover:text-[#f97316]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#f97316]/20 transition hover:bg-[#000000]"
              >
                Create account
                <FiArrowRight />
              </button>

              <p className="mt-3 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#f97316] hover:text-[#f97316]">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
