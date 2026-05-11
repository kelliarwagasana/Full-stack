import { Link } from 'react-router-dom'
import type { User } from '../../auth/types'
import type { DashboardSection } from '../utils/dashboardUtils'
import UserAvatar from './UserAvatar'

interface DashboardSidebarProps {
  currentUser: User
  activeSection: DashboardSection
  isVisible: boolean
}

export default function DashboardSidebar({ currentUser, activeSection, isVisible }: DashboardSidebarProps) {
  const isAdmin = currentUser.role === 'ADMIN'
  const items = [
    { section: 'overview', label: 'Dashboard', marker: 'D' },
    { section: 'listings', label: 'My Listing', marker: 'L' },
    { section: 'reviews', label: 'Reviews', marker: 'R' },
    { section: 'bookings', label: 'Bookings', marker: 'B' },
    { section: 'guests', label: 'Guests', marker: 'G' },
    ...(isAdmin ? [{ section: 'users', label: 'Users', marker: 'U' }] : []),
    { section: 'profile', label: 'Profile', marker: 'P' },
  ] as Array<{ section: DashboardSection; label: string; marker: string }>

  return (
    <aside
      className={`z-40 border-r-2 border-black bg-white text-black transition-transform duration-300 lg:fixed lg:inset-y-0 lg:left-0 lg:w-[315px] ${
        isVisible ? 'block translate-x-0' : 'hidden lg:block lg:-translate-x-full'
      }`}
    >
      <div className="flex h-[78px] items-center gap-3 px-6">
        <span className="flex h-10 w-10 items-center justify-center border-2 border-[#f97316] bg-black text-xl font-black text-[#f97316]">L</span>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-black tracking-tight text-black">List</p>
          <p className="text-2xl font-black text-[#f97316]">On</p>
        </div>
      </div>

      <div className="mx-6 mb-6 flex items-center gap-3 border-2 border-black bg-white p-3 shadow-[5px_5px_0_#f97316] lg:hidden">
        <UserAvatar user={currentUser} size="md" />
        <div className="min-w-0">
          <p className="truncate font-black text-black">{currentUser.name}</p>
          <p className="truncate text-xs text-black/55">{currentUser.email}</p>
        </div>
      </div>

      <p className="px-8 pb-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#f97316]">Main menu</p>
      <nav className="flex gap-2 overflow-x-auto px-6 pb-6 lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const isActive = item.section === activeSection

          return (
            <Link
              key={item.section}
              to={item.section === 'overview' ? '/dashboard' : `/dashboard/${item.section}`}
              className={`flex items-center gap-3 whitespace-nowrap border-2 px-6 py-3 text-sm font-black transition ${
                isActive
                  ? 'border-black bg-[#f97316] text-white shadow-[5px_5px_0_#000]'
                  : 'border-transparent text-black hover:border-black hover:bg-[#fff7ed] hover:text-[#f97316]'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center border text-[10px] ${isActive ? 'border-white' : 'border-black'}`}>
                {item.marker}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

