import { type FormEvent, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../../shared/components/Navbar'
import { listingsData } from '../../../data/listings'
import { getCurrentUser } from '../../auth/authStorage'
import { createBooking } from '../../bookings/bookingsStorage'
import { createReview, getReviewsForListing } from '../reviewsStorage'

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

const defaultCheckIn = toDateInput(addDays(new Date(), 7))
const defaultCheckOut = toDateInput(addDays(new Date(), 10))

export default function ListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const currentUser = getCurrentUser()
  const [checkIn, setCheckIn] = useState(defaultCheckIn)
  const [checkOut, setCheckOut] = useState(defaultCheckOut)
  const [bookingError, setBookingError] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')

  const listing = useMemo(
    () => listingsData.find((item) => item.id === listingId),
    [listingId],
  )
  const [reviews, setReviews] = useState(() => (listingId ? getReviewsForListing(listingId) : []))

  const nights = useMemo(() => {
    const checkInTime = new Date(checkIn).getTime()
    const checkOutTime = new Date(checkOut).getTime()
    const dayInMs = 1000 * 60 * 60 * 24
    return Math.max(0, Math.ceil((checkOutTime - checkInTime) / dayInMs))
  }, [checkIn, checkOut])

  const totalPrice = listing ? nights * listing.pricePerNight : 0
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  const handleBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBookingError('')
    setBookingMessage('')

    if (!listing) {
      setBookingError('Listing not found.')
      return
    }

    if (!currentUser) {
      setBookingError('Please login before booking.')
      return
    }

    if (currentUser.role !== 'GUEST') {
      setBookingError('Only guest accounts can book listings.')
      return
    }

    if (nights < 1) {
      setBookingError('Check-out must be after check-in.')
      return
    }

    const result = createBooking({
      listingId: listing.id,
      guest: currentUser,
      checkIn,
      checkOut,
      totalPrice,
    })

    if (!result.success) {
      setBookingError(result.error)
      return
    }

    setBookingMessage('Booking request created.')
  }

  const handleReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setReviewError('')
    setReviewMessage('')

    if (!listing) {
      setReviewError('Listing not found.')
      return
    }

    if (!currentUser) {
      setReviewError('Please login as a guest before posting a review.')
      return
    }

    const result = createReview({
      listingId: listing.id,
      user: currentUser,
      rating: reviewRating,
      comment: reviewComment,
    })

    if (!result.success) {
      setReviewError(result.error)
      return
    }

    setReviews((currentReviews) => [result.review, ...currentReviews])
    setReviewComment('')
    setReviewRating(5)
    setReviewMessage('Review posted. Thank you for sharing your stay.')
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar variant="solid" />
        <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-6 py-20 text-center">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 shadow-lg shadow-slate-200/30">
            <p className="text-xl font-semibold text-slate-900">Listing not found.</p>
            <Link
              to="/listings"
              className="mt-5 inline-flex rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold text-white hover:bg-[#000000]"
            >
              Back to listings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const firstPhoto = listing.photos[0]

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar variant="solid" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/30 overflow-hidden">
          <div className="relative overflow-hidden">
            {firstPhoto && (
              <img src={firstPhoto.url} alt={listing.title} className="h-[420px] w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 rounded-3xl bg-white/95 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between shadow-lg">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 font-semibold">{listing.location}</p>
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{listing.title}</h1>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-2xl font-bold text-slate-900">${listing.pricePerNight}<span className="text-base font-semibold text-slate-600"> /night</span></p>
                <p className="text-sm text-slate-600">Type: <span className="font-semibold">{listing.type}</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-2xl font-bold text-slate-900">About this property</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-600">Amenities</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {listing.amenities.map((amenity) => (
                          <span key={amenity} className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.35em] font-semibold text-slate-600">Property Details</p>
                    <ul className="mt-4 space-y-3 text-slate-700">
                      <li><span className="font-semibold">{listing.guest}</span> guest{listing.guest > 1 ? 's' : ''}</li>
                      <li>Type: <span className="font-semibold">{listing.type}</span></li>
                      <li>Photos: <span className="font-semibold">{listing.photos.length}</span></li>
                      <li>Reviews: <span className="font-semibold">{reviews.length}</span></li>
                      <li>Rating: <span className="font-semibold">{reviews.length ? averageRating.toFixed(1) : 'New'}</span></li>
                    </ul>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.35em] font-semibold text-slate-600">Host</p>
                    <div className="mt-4 flex items-center gap-4">
                      {listing.host.avatar && (
                        <img src={listing.host.avatar} alt={listing.host.name} className="h-14 w-14 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{listing.host.name}</p>
                        <p className="text-sm text-slate-600">Host since {new Date(listing.host.createdAt).getFullYear()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-lg shadow-slate-200/30">
                <div className="space-y-4">
                  <div className="rounded-3xl bg-white p-4 border border-slate-200">
                    <p className="text-sm uppercase tracking-[0.35em] font-semibold text-slate-600">Booking info</p>
                    <p className="mt-3 text-lg font-bold text-slate-900">Listed on {new Date(listing.createdAt).toLocaleDateString()}</p>
                    <p className="mt-1 text-sm text-slate-600">Last updated {new Date(listing.updatedAt).toLocaleDateString()}</p>
                  </div>

                  <form onSubmit={handleBooking} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <label className="block">
                        <span className="text-sm font-semibold text-slate-700">Check-in</span>
                        <input
                          type="date"
                          value={checkIn}
                          min={toDateInput(new Date())}
                          onChange={(event) => setCheckIn(event.target.value)}
                          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-slate-700">Check-out</span>
                        <input
                          type="date"
                          value={checkOut}
                          min={checkIn}
                          onChange={(event) => setCheckOut(event.target.value)}
                          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
                          required
                        />
                      </label>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{nights} night{nights === 1 ? '' : 's'}</span>
                        <span>${listing.pricePerNight} / night</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                        <span className="text-sm font-semibold text-slate-700">Total</span>
                        <span className="text-2xl font-bold text-slate-950">${totalPrice}</span>
                      </div>
                    </div>

                    {bookingError && (
                      <p className="rounded-lg border border-[#f97316] bg-[#fff7ed] px-4 py-3 text-sm font-bold text-black">
                        {bookingError}
                      </p>
                    )}

                    {bookingMessage && (
                      <p className="rounded-lg border border-black bg-white px-4 py-3 text-sm font-bold text-black">
                        {bookingMessage}
                      </p>
                    )}

                    {!currentUser ? (
                      <Link
                        to="/login"
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#f97316] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#000000]"
                      >
                        Login to book
                      </Link>
                    ) : currentUser.role === 'GUEST' ? (
                      <button
                        type="submit"
                        className="w-full rounded-full bg-[#f97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
                      >
                        Book stay
                      </button>
                    ) : (
                      <Link
                        to="/dashboard"
                        className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Open dashboard
                      </Link>
                    )}

                    {bookingMessage && (
                      <Link
                        to="/bookings"
                        className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        View bookings
                      </Link>
                    )}
                  </form>

                  <Link
                    to="/listings"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#f97316] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#000000]"
                  >
                    Explore more stays
                  </Link>
                </div>
              </aside>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-600">Guest reviews</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {reviews.length ? `${averageRating.toFixed(1)} out of 5` : 'No reviews yet'}
                  </h2>
                </div>
                <div className="flex text-2xl text-[#f97316]" aria-label={`${averageRating.toFixed(1)} star rating`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>{star <= Math.round(averageRating) ? '*' : '-'}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={handleReview} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-bold text-slate-900">Post your review</h3>
                  <p className="mt-1 text-sm text-slate-600">Guest accounts can rate and review this listing.</p>

                  <div className="mt-5">
                    <span className="text-sm font-semibold text-slate-700">Rating</span>
                    <div className="mt-2 flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewRating(rating)}
                          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition ${
                            rating <= reviewRating
                              ? 'border-[#f97316] bg-[#f97316] text-white'
                              : 'border-slate-300 bg-white text-slate-600 hover:border-[#ff9a8d]'
                          }`}
                          aria-label={`${rating} star rating`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="mt-5 block">
                    <span className="text-sm font-semibold text-slate-700">Your review</span>
                    <textarea
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      rows={4}
                      className="mt-2 w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
                      placeholder="Tell future guests what stood out..."
                      required
                    />
                  </label>

                  {reviewError && (
                    <p className="mt-4 rounded-lg border border-[#f97316] bg-[#fff7ed] px-4 py-3 text-sm font-bold text-black">
                      {reviewError}
                    </p>
                  )}

                  {reviewMessage && (
                    <p className="mt-4 rounded-lg border border-black bg-white px-4 py-3 text-sm font-bold text-black">
                      {reviewMessage}
                    </p>
                  )}

                  {!currentUser ? (
                    <Link
                      to="/login"
                      className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#f97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
                    >
                      Login to review
                    </Link>
                  ) : currentUser.role === 'GUEST' ? (
                    <button
                      type="submit"
                      className="mt-5 w-full rounded-full bg-[#f97316] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
                    >
                      Post review
                    </button>
                  ) : (
                    <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      Only guest accounts can post listing reviews.
                    </p>
                  )}
                </form>

                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                      No guest reviews yet. Be the first to share feedback.
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {review.user.avatar && (
                              <img src={review.user.avatar} alt={review.user.name} className="h-11 w-11 rounded-full object-cover" />
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">{review.user.name}</p>
                              <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-sm font-bold text-[#f97316]">
                            {review.rating}/5
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-700">{review.comment}</p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

