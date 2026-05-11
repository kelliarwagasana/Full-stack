import { listingsData } from '../../../data/listings'
import { getBookings } from '../../bookings/bookingsStorage'
import { getAuthUsers } from '../../auth/authStorage'
import { getReviews } from '../../listings/reviewsStorage'
import type { Booking } from '../../bookings/types'
import type { Listing, Review } from '../../listings/types'
import type { User } from '../../auth/types'

export type DashboardSection =
  | 'overview'
  | 'bookings'
  | 'guests'
  | 'users'
  | 'reviews'
  | 'listings'
  | 'profile'

export interface DashboardData {
  visibleListings: Listing[]
  visibleBookings: Booking[]
  visibleReviews: Review[]
  guests: User[]
  users: User[]
  revenue: number
  pendingBookings: number
  totalListings: number
  totalBookings: number
  totalReviews: number
  totalUsers: number
  totalHosts: number
  totalGuests: number
  confirmedBookings: number
  cancelledBookings: number
}

export interface DashboardOutletContext {
  dashboardData: DashboardData
  currentUser: User
  isAdmin: boolean
}

export function getDashboardSection(section?: string, isAdmin = false): DashboardSection {
  const allowedSections: DashboardSection[] = [
    'overview',
    'bookings',
    'guests',
    'reviews',
    'listings',
    'profile',
  ]

  if (isAdmin) {
    allowedSections.splice(3, 0, 'users')
  }

  if (section && allowedSections.includes(section as DashboardSection)) {
    return section as DashboardSection
  }

  if (section === 'upload') {
    return 'listings'
  }

  return 'overview'
}

export function getSectionTitle(section: DashboardSection) {
  const titles: Record<DashboardSection, string> = {
    overview: 'Dashboard home',
    bookings: 'Bookings',
    guests: 'Guest list',
    users: 'Users list',
    reviews: 'Reviews',
    listings: 'Listings',
    profile: 'Profile',
  }

  return titles[section]
}

export function buildDashboardData(currentUser: User | null): DashboardData {
  const bookings = getBookings()
  const isHost = currentUser?.role === 'HOST'
  const visibleListings = isHost
    ? listingsData.filter((listing) => listing.hostId === currentUser.id)
    : listingsData
  const visibleListingIds = new Set(visibleListings.map((listing) => listing.id))
  const visibleBookings = isHost
    ? bookings.filter((booking) => booking.listing.hostId === currentUser.id)
    : bookings
  const visibleReviews = getReviews().filter((review) => visibleListingIds.has(review.listingId))
  const guestMap = new Map(visibleBookings.map((booking) => [booking.guest.id, booking.guest]))
  const revenue = visibleBookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
  const pendingBookings = visibleBookings.filter((booking) => booking.status === 'PENDING').length
  const users = getAuthUsers()

  return {
    visibleListings,
    visibleBookings,
    visibleReviews,
    guests: Array.from(guestMap.values()),
    users,
    revenue,
    pendingBookings,
    totalListings: listingsData.length,
    totalBookings: bookings.length,
    totalReviews: getReviews().length,
    totalUsers: users.length,
    totalHosts: users.filter((user) => user.role === 'HOST').length,
    totalGuests: users.filter((user) => user.role === 'GUEST').length,
    confirmedBookings: visibleBookings.filter((booking) => booking.status === 'CONFIRMED').length,
    cancelledBookings: visibleBookings.filter((booking) => booking.status === 'CANCELLED').length,
  }
}

export function money(amount: number) {
  return `$${amount.toLocaleString()}`
}

export function statusClasses(status: string) {
  if (status === 'CONFIRMED') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  if (status === 'CANCELLED') {
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return 'bg-amber-50 text-amber-700 border-amber-200'
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

