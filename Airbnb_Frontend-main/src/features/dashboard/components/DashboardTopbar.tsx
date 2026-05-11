import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../../auth/authStorage'
import type { User } from '../../auth/types'
import { getSectionTitle } from '../utils/dashboardUtils'
import type { DashboardSection } from '../utils/dashboardUtils'
import UserAvatar from './UserAvatar'

interface DashboardTopbarProps {
  currentUser: User
  activeSection: DashboardSection
  isSidebarVisible: boolean
  onToggleSidebar: () => void
}

export default function DashboardTopbar({
  currentUser,
  activeSection,
  isSidebarVisible,
  onToggleSidebar,
}: DashboardTopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-[#f5d8c8]/95 backdrop-blur">
      <div className="flex min-h-[78px] items-center justify-between gap-4 px-5 lg:px-7">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff432e] text-lg font-bold text-white shadow-sm transition hover:bg-[#e93623]"
          >
            =
          </button>
          <h1 className="text-lg font-bold text-[#292626]">{getSectionTitle(activeSection)}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex items-center gap-3 rounded-2xl px-1 py-1 text-left transition hover:bg-white/35"
            >
              <span className="relative">
                <UserAvatar user={currentUser} size="md" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#f5d8c8] bg-[#55b64b]" />
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-semibold text-[#473f3d]">{currentUser.name}</span>
                <span className="block text-xs text-[#857d7a]">{currentUser.email}</span>
              </span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[#eadfdb] bg-white p-2 shadow-lg shadow-slate-900/10">
                <Link
                  to="/dashboard/profile"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

