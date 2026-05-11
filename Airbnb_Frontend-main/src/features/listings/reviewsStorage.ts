import { reviewsData } from '../../data/reviews'
import type { User } from '../auth/types'
import type { Review } from './types'

const REVIEWS_KEY = 'liston.reviews'
export const REVIEWS_CHANGE_EVENT = 'liston-reviews-change'

interface CreateReviewInput {
  listingId: string
  user: User
  rating: number
  comment: string
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function mergeSeedReviews(reviews: Review[]) {
  const reviewMap = new Map(reviews.map((review) => [review.id, review]))

  reviewsData.forEach((review) => {
    if (!reviewMap.has(review.id)) {
      reviewMap.set(review.id, review)
    }
  })

  return Array.from(reviewMap.values())
}

function writeReviews(reviews: Review[]) {
  getStorage()?.setItem(REVIEWS_KEY, JSON.stringify(reviews))
}

function announceReviewsChange() {
  window.dispatchEvent(new Event(REVIEWS_CHANGE_EVENT))
}

export function getReviews(): Review[] {
  const storage = getStorage()

  if (!storage) {
    return reviewsData
  }

  const savedReviews = storage.getItem(REVIEWS_KEY)

  if (!savedReviews) {
    storage.setItem(REVIEWS_KEY, JSON.stringify(reviewsData))
    return reviewsData
  }

  try {
    const parsedReviews = JSON.parse(savedReviews) as Review[]
    const reviews = Array.isArray(parsedReviews) ? mergeSeedReviews(parsedReviews) : reviewsData

    writeReviews(reviews)
    return reviews
  } catch {
    writeReviews(reviewsData)
    return reviewsData
  }
}

export function getReviewsForListing(listingId: string) {
  return getReviews().filter((review) => review.listingId === listingId)
}

export function createReview(input: CreateReviewInput) {
  const rating = Math.round(input.rating)
  const comment = input.comment.trim()

  if (input.user.role !== 'GUEST') {
    return { success: false, error: 'Only guest accounts can post reviews.' } as const
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: 'Please choose a rating from 1 to 5.' } as const
  }

  if (comment.length < 8) {
    return { success: false, error: 'Please write a review with at least 8 characters.' } as const
  }

  const review: Review = {
    id: `review-${Date.now()}`,
    rating,
    comment,
    userId: input.user.id,
    listingId: input.listingId,
    user: input.user,
    createdAt: new Date().toISOString(),
  }

  writeReviews([review, ...getReviews()])
  announceReviewsChange()

  return { success: true, review } as const
}

export function subscribeToReviewsChange(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === REVIEWS_KEY) {
      callback()
    }
  }

  window.addEventListener(REVIEWS_CHANGE_EVENT, callback)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(REVIEWS_CHANGE_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}

