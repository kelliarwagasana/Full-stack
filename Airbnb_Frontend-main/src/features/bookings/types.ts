import type { Booking, BookingStatus } from '../listings/types'
import type { User } from '../auth/types'

export type { Booking, BookingStatus }

export interface CreateBookingInput {
  listingId: string
  guest: User
  checkIn: string
  checkOut: string
  totalPrice: number
}

