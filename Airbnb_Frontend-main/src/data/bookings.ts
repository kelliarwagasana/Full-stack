import type { Booking } from '../features/listings/types'
import { listingsData } from './listings'
import { mockUsers } from './users'

function getListing(listingId: string) {
  const listing = listingsData.find((item) => item.id === listingId)

  if (!listing) {
    throw new Error(`Missing mock listing: ${listingId}`)
  }

  return listing
}

export const bookingsData: Booking[] = [
  {
    id: 'booking-1',
    checkIn: '2026-06-12',
    checkOut: '2026-06-16',
    totalPrice: 880,
    status: 'CONFIRMED',
    listingId: 'listing-1',
    guestId: 'user-guest-1',
    listing: getListing('listing-1'),
    guest: mockUsers['user-guest-1'],
    createdAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'booking-2',
    checkIn: '2026-07-03',
    checkOut: '2026-07-07',
    totalPrice: 1540,
    status: 'PENDING',
    listingId: 'listing-2',
    guestId: 'user-guest-1',
    listing: getListing('listing-2'),
    guest: mockUsers['user-guest-1'],
    createdAt: '2026-04-21T10:00:00Z',
  },
  {
    id: 'booking-3',
    checkIn: '2026-08-19',
    checkOut: '2026-08-22',
    totalPrice: 495,
    status: 'CONFIRMED',
    listingId: 'listing-9',
    guestId: 'user-guest-2',
    listing: getListing('listing-9'),
    guest: mockUsers['user-guest-2'],
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'booking-4',
    checkIn: '2026-09-05',
    checkOut: '2026-09-10',
    totalPrice: 2700,
    status: 'CONFIRMED',
    listingId: 'listing-7',
    guestId: 'user-guest-2',
    listing: getListing('listing-7'),
    guest: mockUsers['user-guest-2'],
    createdAt: '2026-05-03T10:00:00Z',
  },
]

