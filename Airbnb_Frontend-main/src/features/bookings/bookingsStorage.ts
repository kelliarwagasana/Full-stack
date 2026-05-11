import { bookingsData } from '../../data/bookings'
import { listingsData } from '../../data/listings'
import type { Booking, BookingStatus } from '../listings/types'
import type { CreateBookingInput } from './types'

const BOOKINGS_KEY = 'liston.bookings'
export const BOOKINGS_CHANGE_EVENT = 'liston-bookings-change'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function mergeSeedBookings(bookings: Booking[]) {
  const bookingMap = new Map(bookings.map((booking) => [booking.id, booking]))
  bookingsData.forEach((booking) => {
    if (!bookingMap.has(booking.id)) {
      bookingMap.set(booking.id, booking)
    }
  })

  return Array.from(bookingMap.values())
}

function writeBookings(bookings: Booking[]) {
  getStorage()?.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
}

function announceBookingsChange() {
  window.dispatchEvent(new Event(BOOKINGS_CHANGE_EVENT))
}

export function getBookings(): Booking[] {
  const storage = getStorage()

  if (!storage) {
    return bookingsData
  }

  const savedBookings = storage.getItem(BOOKINGS_KEY)

  if (!savedBookings) {
    storage.setItem(BOOKINGS_KEY, JSON.stringify(bookingsData))
    return bookingsData
  }

  try {
    const parsedBookings = JSON.parse(savedBookings) as Booking[]
    const bookings = Array.isArray(parsedBookings)
      ? mergeSeedBookings(parsedBookings)
      : bookingsData

    writeBookings(bookings)
    return bookings
  } catch {
    writeBookings(bookingsData)
    return bookingsData
  }
}

export function getBookingsForGuest(guestId: string) {
  return getBookings().filter((booking) => booking.guestId === guestId)
}

export function getBookingsForHost(hostId: string) {
  return getBookings().filter((booking) => booking.listing.hostId === hostId)
}

export function createBooking(input: CreateBookingInput) {
  const listing = listingsData.find((item) => item.id === input.listingId)

  if (!listing) {
    return { success: false, error: 'Listing not found.' } as const
  }

  const booking: Booking = {
    id: `booking-${Date.now()}`,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    totalPrice: input.totalPrice,
    status: 'PENDING',
    listingId: input.listingId,
    guestId: input.guest.id,
    listing,
    guest: input.guest,
    createdAt: new Date().toISOString(),
  }

  writeBookings([booking, ...getBookings()])
  announceBookingsChange()

  return { success: true, booking } as const
}

function replaceBooking(updatedBooking: Booking) {
  const bookings = getBookings().map((booking) => (
    booking.id === updatedBooking.id ? updatedBooking : booking
  ))

  writeBookings(bookings)
  announceBookingsChange()
  return updatedBooking
}

export function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const booking = getBookings().find((item) => item.id === bookingId)

  if (!booking) {
    return { success: false, error: 'Booking not found.' } as const
  }

  return { success: true, booking: replaceBooking({ ...booking, status }) } as const
}

export function extendBooking(bookingId: string, nextCheckOut: string) {
  const booking = getBookings().find((item) => item.id === bookingId)

  if (!booking) {
    return { success: false, error: 'Booking not found.' } as const
  }

  const checkInTime = new Date(booking.checkIn).getTime()
  const checkOutTime = new Date(nextCheckOut).getTime()
  const dayInMs = 1000 * 60 * 60 * 24
  const nights = Math.ceil((checkOutTime - checkInTime) / dayInMs)

  if (nights < 1) {
    return { success: false, error: 'Check-out must be after check-in.' } as const
  }

  const updatedBooking: Booking = {
    ...booking,
    checkOut: nextCheckOut,
    totalPrice: nights * booking.listing.pricePerNight,
    status: booking.status === 'CANCELLED' ? 'PENDING' : booking.status,
  }

  return { success: true, booking: replaceBooking(updatedBooking) } as const
}

export function subscribeToBookingsChange(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === BOOKINGS_KEY) {
      callback()
    }
  }

  window.addEventListener(BOOKINGS_CHANGE_EVENT, callback)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(BOOKINGS_CHANGE_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}

