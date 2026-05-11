import { useState, type FormEvent } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'
import { demoAccounts } from '../../../data/users'
import type { LoginCredentials } from '../types'

interface LoginFormProps {
  error?: string
  onSubmit: (credentials: LoginCredentials) => void
  onDemoLogin: (credentials: LoginCredentials) => void
  onGoogleLogin: () => void
}

export default function LoginForm({ error, onSubmit, onDemoLogin, onGoogleLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur"
    >
      <div className="absolute right-[-4rem] top-[-4rem] h-36 w-36 rounded-full bg-[#fff1ec]" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff432e]">Welcome back</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Sign in to Airbnb</h1>
        <p className="mt-2 text-sm leading-5 text-slate-500">
          Continue managing bookings, saved stays, reviews, and your travel dashboard.
        </p>

        <button
          type="button"
          onClick={onGoogleLogin}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-[#ffd6ce] hover:bg-[#fff1ec]"
        >
          <FcGoogle className="text-xl" />
          Sign in with Google
        </button>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">or email</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Email address</span>
            <span className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-[#ff432e] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff432e]/10">
              <FiMail className="text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="name@example.com"
                className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Password</span>
            <span className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-[#ff432e] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff432e]/10">
              <FiLock className="text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="text-slate-400 transition hover:text-[#ff432e]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff432e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ff432e]/20 transition hover:bg-[#e93623]"
        >
          Sign in
          <FiArrowRight />
        </button>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Demo access</p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => onDemoLogin(account)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#ffd6ce] hover:bg-[#fff1ec] hover:text-[#c92f20]"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  )
}

