import type { User } from '../auth/types'

export type ListingType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface ListingPhoto {
  id: string
  url: string
  publicId: string
  listingId: string
}

export interface Review {
  id: string
  rating: number
  comment: string
  userId: string
  listingId: string
  user: User
  createdAt: string
}

export interface Booking {
  id: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: BookingStatus
  listingId: string
  guestId: string
  listing: Listing
  guest: User
  createdAt: string
}

export interface Listing {
  id: string
  title: string
  pricePerNight: number
  guest: number
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  type: ListingType
  amenities: string[]
  hostId: string
  host: User
  createdAt: string
  updatedAt: string
  photos: ListingPhoto[]
  reviews: Review[]
  bookings?: Booking[]
}

