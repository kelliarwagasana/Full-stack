import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../../shared/components/Navbar'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopbar from '../components/DashboardTopbar'
import { buildDashboardData, getDashboardSection } from '../utils/dashboardUtils'
import { getCurrentUser, subscribeToAuthChange } from '../../auth/authStorage'

export default function DashboardLayout() {
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser())
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const isAdmin = currentUser?.role === 'ADMIN'
  const section = location.pathname.startsWith('/dashboard/')
    ? location.pathname.replace('/dashboard/', '').split('/')[0]
    : undefined
  const activeSection = getDashboardSection(section, isAdmin)
  const dashboardData = useMemo(() => buildDashboardData(currentUser), [currentUser])

  useEffect(() => {
    return subscribeToAuthChange(() => setCurrentUser(getCurrentUser()))
  }, [])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Navbar variant="solid" />
        <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-6 py-16 text-center">
          <div className="w-full border-2 border-black bg-white p-8 shadow-[8px_8px_0_#f97316]">
            <h1 className="text-3xl font-black text-black">Login required</h1>
            <Link
              to="/login"
              className="mt-6 inline-flex border-2 border-black bg-[#f97316] px-5 py-3 text-sm font-black text-white transition hover:bg-black"
            >
              Login
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (currentUser.role === 'GUEST') {
    return null
  }

  return (
    <div className={`min-h-screen bg-white text-[13px] text-black transition-all duration-300 ${isSidebarVisible ? 'lg:pl-[315px]' : ''}`}>
      <DashboardSidebar currentUser={currentUser} activeSection={activeSection} isVisible={isSidebarVisible} />
      <div className="min-w-0">
        <DashboardTopbar
          currentUser={currentUser}
          activeSection={activeSection}
          isSidebarVisible={isSidebarVisible}
          onToggleSidebar={() => setIsSidebarVisible((current) => !current)}
        />
        <main className="p-4 lg:p-7">
          <Outlet context={{ dashboardData, currentUser, isAdmin }} />
        </main>
      </div>
    </div>
  )
}

