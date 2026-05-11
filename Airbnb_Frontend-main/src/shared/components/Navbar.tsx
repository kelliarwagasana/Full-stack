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
  const headerClasses = `${headerPosition} top-0 left-0 right-0 z-50 w-full border-b transition-colors duration-300 ${
    isSolid
      ? 'border-black/10 bg-white/95 text-black backdrop-blur-xl'
      : 'border-white/15 bg-black/15 text-white backdrop-blur-sm'
  }`

  const linkClasses = `transition ${isSolid ? 'text-black/70 hover:text-[#f97316]' : 'text-white/85 hover:text-[#f97316]'}`
  const authTextClass = isSolid ? 'text-black/70 hover:text-[#f97316]' : 'text-white hover:text-[#f97316]'

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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center border-2 border-[#f97316] bg-black text-xl font-black text-[#f97316]">
            L
          </span>
          <span className={`text-2xl font-black uppercase tracking-tight ${isSolid ? 'text-black' : 'text-white'}`}>
            List<span className="text-[#f97316]">On</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] md:flex">
          {[...navLinks, ...roleLinks].map((link) => (
            <Link key={link.label} to={link.to} className={`${linkClasses} px-3 py-2`}>
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
                className={`flex items-center gap-2 border px-2 py-1.5 transition ${
                  isSolid
                    ? 'border-black bg-white text-black hover:bg-[#fff7ed]'
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
                <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden border-2 border-black bg-white text-black shadow-[8px_8px_0_#f97316]">
                  <div className="flex items-center gap-3 border-b border-black/10 p-4">
                    <UserAvatar user={currentUser} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-black">{currentUser.name}</p>
                      <p className="truncate text-xs text-black/55">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      to={currentUser.role === 'GUEST' ? '/profile' : '/dashboard/profile'}
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-black transition hover:bg-[#fff7ed] hover:text-[#f97316]"
                    >
                      <FiUser className="text-[#f97316]" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-semibold text-black transition hover:bg-[#fff7ed] hover:text-[#f97316]"
                    >
                      <FiLogOut className="text-[#f97316]" />
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
                className="border-2 border-black bg-[#f97316] px-4 py-2 text-sm font-black text-white transition hover:bg-black"
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
