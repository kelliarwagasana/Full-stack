import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi'
import { getCurrentUser, logout, subscribeToAuthChange } from '../../features/auth/authStorage'
import type { User } from '../../features/auth/types'
import UserAvatar from '../../features/dashboard/components/UserAvatar'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Listings', to: '/listings' },
  // { label: 'Explore', to: '/explore' },
]

interface NavbarProps {
  variant?: 'transparent' | 'solid'
}

export default function Navbar({ variant = 'transparent' }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser())
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    return subscribeToAuthChange(() => setCurrentUser(getCurrentUser()))
  }, [])

  const isSolid = variant === 'solid' || isScrolled
  const headerPosition = variant === 'transparent' && isScrolled ? 'fixed' : 'sticky'
  const headerClasses = `${headerPosition} top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${
    isSolid
      ? 'bg-white/95 text-slate-900 shadow-sm shadow-slate-900/10 backdrop-blur-xl'
      : 'bg-transparent text-white'
  }`

  const linkClasses = `transition ${isSolid ? 'text-slate-700 hover:text-slate-950' : 'text-slate-100 hover:text-white'}`
  const authTextClass = isSolid ? 'text-slate-700 hover:text-slate-950' : 'text-white hover:text-[#ffd6ce]'

  const handleLogout = () => {
    logout()
    setIsAccountOpen(false)
    window.location.hash = '#/'
  }

  const roleLinks = currentUser
    ? currentUser.role === 'GUEST'
      ? [
          { label: 'Saved', to: '/saved' },
          { label: 'Bookings', to: '/bookings' },
        ]
      : [{ label: 'Dashboard', to: '/dashboard' }]
    : []

  return (
    <header className={headerClasses}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ff432e] text-xl font-semibold text-white shadow-lg shadow-[#ff432e]/20">
            A
          </span>
          <span className={`text-2xl font-bold ${isSolid ? 'text-slate-950' : 'text-white'}`}>
            air<span className="text-[#ff432e]">bnb</span>
          </span>
        </Link>

        <nav className="hidden gap-8 text-sm font-medium md:flex">
          {[...navLinks, ...roleLinks].map((link) => (
            <Link key={link.label} to={link.to} className={linkClasses}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountOpen((current) => !current)}
                className={`flex items-center gap-2 rounded-full border px-2 py-1.5 shadow-sm transition ${
                  isSolid
                    ? 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                    : 'border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20'
                }`}
                aria-expanded={isAccountOpen}
                aria-label="Open account menu"
              >
                <UserAvatar user={currentUser} size="sm" />
                <span className="hidden max-w-28 truncate text-sm font-bold sm:inline">{currentUser.name}</span>
                <FiChevronDown className={`transition ${isAccountOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-900/15">
                  <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                    <UserAvatar user={currentUser} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">{currentUser.name}</p>
                      <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      to={currentUser.role === 'GUEST' ? '/profile' : '/dashboard/profile'}
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#fff1ec] hover:text-[#c92f20]"
                    >
                      <FiUser className="text-[#ff432e]" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <FiLogOut className="text-red-500" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={`text-sm font-medium ${authTextClass}`}>
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-[#ff432e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e93623]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
