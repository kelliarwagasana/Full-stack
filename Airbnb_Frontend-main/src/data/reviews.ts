import type { Review } from '../features/listings/types'
import { mockUsers } from './users'

export const reviewsData: Review[] = [
  {
    id: 'review-1',
    rating: 5,
    comment: 'Beautiful stay and very responsive host.',
    userId: 'user-guest-1',
    listingId: 'listing-1',
    user: mockUsers['user-guest-1'],
    createdAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 'review-2',
    rating: 4,
    comment: 'The location was excellent and check-in was smooth.',
    userId: 'user-guest-2',
    listingId: 'listing-9',
    user: mockUsers['user-guest-2'],
    createdAt: '2026-05-02T10:00:00Z',
  },
  {
    id: 'review-3',
    rating: 5,
    comment: 'Clean, quiet, and exactly as shown in the photos.',
    userId: 'user-guest-1',
    listingId: 'listing-2',
    user: mockUsers['user-guest-1'],
    createdAt: '2026-05-05T10:00:00Z',
  },
  {
    id: 'review-4',
    rating: 4,
    comment: 'Great views and comfortable rooms for our group.',
    userId: 'user-guest-2',
    listingId: 'listing-7',
    user: mockUsers['user-guest-2'],
    createdAt: '2026-05-07T10:00:00Z',
  },
]

