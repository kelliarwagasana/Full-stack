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
    <header className="sticky top-0 z-30 border-b-2 border-black bg-white/95 backdrop-blur">
      <div className="flex min-h-[78px] items-center justify-between gap-4 px-5 lg:px-7">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
            className="flex h-11 w-11 items-center justify-center border-2 border-black bg-[#f97316] text-lg font-black text-white transition hover:bg-black"
          >
            =
          </button>
          <h1 className="text-lg font-black uppercase tracking-[0.12em] text-black">{getSectionTitle(activeSection)}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex items-center gap-3 border-2 border-transparent px-1 py-1 text-left transition hover:border-black hover:bg-[#fff7ed]"
            >
              <span className="relative">
                <UserAvatar user={currentUser} size="md" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 border-2 border-white bg-[#f97316]" />
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-black text-black">{currentUser.name}</span>
                <span className="block text-xs text-black/55">{currentUser.email}</span>
              </span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 border-2 border-black bg-white p-2 shadow-[6px_6px_0_#f97316]">
                <Link
                  to="/dashboard/profile"
                  className="block px-3 py-2 text-sm font-black text-black hover:bg-[#fff7ed]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 w-full px-3 py-2 text-left text-sm font-black text-[#f97316] hover:bg-[#fff7ed]"
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

