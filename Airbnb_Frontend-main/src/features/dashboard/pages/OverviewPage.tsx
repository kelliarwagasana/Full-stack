import type { DashboardData, DashboardOutletContext } from '../utils/dashboardUtils'
import { money } from '../utils/dashboardUtils'
import { Link } from 'react-router-dom'
import type { User } from '../../auth/types'
import { useOutletContext } from 'react-router-dom'

function StatGrid({ data, isAdmin }: { data: DashboardData; isAdmin: boolean }) {
  const stats = [
    { label: isAdmin ? 'Total listings' : 'My listings', value: data.visibleListings.length, accent: 'chart' },
    { label: 'Bookings', value: data.visibleBookings.length, accent: 'pie' },
    { label: 'Revenue', value: money(data.revenue), accent: 'bars' },
    { label: isAdmin ? 'Users' : 'Pending', value: isAdmin ? data.totalUsers : data.pendingBookings, accent: 'chart' },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <div key={item.label} className="flex min-h-28 items-center justify-between rounded-2xl border border-[#eadfdb] bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm text-[#a79d99]">{item.label}</p>
            <p className="mt-2 text-3xl font-medium text-[#473f3d]">{item.value}</p>
          </div>
          <div className="relative h-16 w-16 text-[#ff432e]">
            {item.accent === 'pie' ? (
              <span className="block h-12 w-12 rounded-full bg-[#ff432e] shadow-[inset_18px_0_0_rgba(255,255,255,0.9)]" />
            ) : (
              <span className="absolute inset-x-1 bottom-2 h-10 rounded-b-lg border-b-4 border-l-4 border-[#ff432e]">
                <span className="absolute left-1 top-2 h-7 w-2 rounded-full border-2 border-[#ff432e]" />
                <span className="absolute left-6 top-5 h-5 w-2 rounded-full border-2 border-[#ff432e]" />
                <span className="absolute left-11 top-1 h-9 w-2 rounded-full border-2 border-[#ff432e]" />
              </span>
            )}
          </div>
        </div>
      ))}
    </section>
  )
}

function OverviewSection({ data, currentUser }: { data: DashboardData; currentUser: User }) {
  const isAdmin = currentUser.role === 'ADMIN'

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-br-2xl rounded-bl-2xl bg-gradient-to-r from-[#ff432e] via-[#ff742e] to-[#ffc145] px-6 py-5 text-white">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(30deg,#fff_1px,transparent_1px),linear-gradient(150deg,#fff_1px,transparent_1px)] [background-size:34px_20px]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-white/80">{currentUser.role}</p>
            <h2 className="mt-1 text-2xl font-bold">{isAdmin ? 'Admin dashboard' : 'Host dashboard'}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
              {isAdmin
                ? 'Monitor users, listings, bookings, guests, and reviews across the marketplace.'
                : 'Track your listings, bookings, guests, reviews, and profile from one workspace.'}
            </p>
          </div>
          <Link
            to="/dashboard/listings"
            className="inline-flex w-fit rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#292626] transition hover:bg-white/90"
          >
            Manage listings
          </Link>
        </div>
      </section>

      <StatGrid data={data} isAdmin={isAdmin} />
    </div>
  )
}

export default function OverviewPage() {
  const { dashboardData, currentUser } = useOutletContext<DashboardOutletContext>()
  const orders = dashboardData.visibleBookings.length
  const visitors = dashboardData.visibleListings.reduce((sum, listing) => sum + listing.guest * 97, 0)
  const systemCards = [
    { label: 'Listings', value: dashboardData.visibleListings.length, meta: `${dashboardData.totalListings} in system` },
    { label: 'Bookings', value: dashboardData.visibleBookings.length, meta: `${dashboardData.pendingBookings} pending` },
    { label: 'Reviews', value: dashboardData.visibleReviews.length, meta: `${dashboardData.totalReviews} in system` },
    { label: 'Guests', value: dashboardData.guests.length, meta: `${dashboardData.totalGuests} guest accounts` },
    { label: 'Hosts', value: dashboardData.totalHosts, meta: 'active host accounts' },
    { label: 'Users', value: dashboardData.totalUsers, meta: 'registered accounts' },
  ]
  const bookingStatus = [
    { label: 'Confirmed', value: dashboardData.confirmedBookings, color: 'bg-emerald-500' },
    { label: 'Pending', value: dashboardData.pendingBookings, color: 'bg-amber-500' },
    { label: 'Cancelled', value: dashboardData.cancelledBookings, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-4">
      <OverviewSection data={dashboardData} currentUser={currentUser} />
      <section className="grid overflow-hidden rounded-2xl border border-[#eadfdb] bg-white shadow-sm md:grid-cols-3">
        {[
          { label: 'Total Income', value: money(dashboardData.revenue), note: '20.9%  +18.4k this week', good: true },
          { label: 'Visitors', value: visitors.toLocaleString(), note: '20%  +3.5k this week', good: true },
          { label: 'Total Orders', value: orders.toLocaleString(), note: '9.01%  decrease compared to last week', good: false },
        ].map((item) => (
          <div key={item.label} className="border-[#f0e5e1] p-6 md:border-r last:md:border-r-0">
            <p className="text-base font-medium text-[#473f3d]">{item.label}</p>
            <p className="mt-7 text-4xl font-medium text-[#473f3d]">{item.value}</p>
            <p className={`mt-3 text-sm font-semibold ${item.good ? 'text-[#65a719]' : 'text-[#ff432e]'}`}>{item.note}</p>
          </div>
        ))}
      </section>
      <section className="rounded-2xl border border-[#eadfdb] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#f0e5e1] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#292626]">System overview</h2>
            <p className="mt-1 text-sm text-[#857d7a]">A quick view of the marketplace data available to this account.</p>
          </div>
          <Link
            to="/dashboard/listings"
            className="hidden rounded-lg border border-[#ff432e] px-4 py-2 text-sm font-semibold text-[#ff432e] transition hover:bg-[#fff4f0] sm:inline-flex"
          >
            Add listing
          </Link>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
          {systemCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-[#f0e5e1] bg-[#fffaf8] p-5">
              <p className="text-sm font-medium text-[#857d7a]">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#292626]">{card.value}</p>
              <p className="mt-2 text-sm text-[#a79d99]">{card.meta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-[#eadfdb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#292626]">Booking status</h2>
          <div className="mt-6 space-y-4">
            {bookingStatus.map((item) => {
              const percent = orders ? Math.round((item.value / orders) * 100) : 0

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#473f3d]">{item.label}</span>
                    <span className="text-[#857d7a]">{item.value} ({percent}%)</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#f7f1ef]">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#eadfdb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#292626]">Recent activity</h2>
          <div className="mt-5 space-y-3">
            {[
              `${dashboardData.visibleBookings.length} bookings tracked`,
              `${dashboardData.visibleReviews.length} reviews received`,
              `${dashboardData.visibleListings.length} listings available`,
            ].map((item) => (
              <div key={item} className="rounded-xl bg-[#fff4f0] px-4 py-3 text-sm font-semibold text-[#473f3d]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

