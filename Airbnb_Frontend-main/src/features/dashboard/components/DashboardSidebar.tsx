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
      className={`z-40 border-r border-[#eee4e0] bg-[#f5eeee] text-[#473f3d] transition-transform duration-300 lg:fixed lg:inset-y-0 lg:left-0 lg:w-[315px] ${
        isVisible ? 'block translate-x-0' : 'hidden lg:block lg:-translate-x-full'
      }`}
    >
      <div className="flex h-[78px] items-center gap-3 px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff432e] text-xl font-black text-white">A</span>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-semibold tracking-tight text-[#292626]">air</p>
          <p className="text-2xl font-semibold italic text-[#ff432e]">bnb</p>
        </div>
      </div>

      <div className="mx-6 mb-6 flex items-center gap-3 rounded-lg border border-white/70 bg-white/45 p-3 lg:hidden">
        <UserAvatar user={currentUser} size="md" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#292626]">{currentUser.name}</p>
          <p className="truncate text-xs text-[#857d7a]">{currentUser.email}</p>
        </div>
      </div>

      <p className="px-8 pb-4 text-[11px] font-bold uppercase text-[#8f8784]">Main menu</p>
      <nav className="flex gap-2 overflow-x-auto px-6 pb-6 lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const isActive = item.section === activeSection

          return (
            <Link
              key={item.section}
              to={item.section === 'overview' ? '/dashboard' : `/dashboard/${item.section}`}
              className={`flex items-center gap-3 whitespace-nowrap rounded-[22px] px-6 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#f9ded8] text-[#ff432e] shadow-[inset_5px_0_0_#ff432e]'
                  : 'text-[#514946] hover:bg-white/60 hover:text-[#ff432e]'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${isActive ? 'border-[#ff432e]' : 'border-[#514946]'}`}>
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

