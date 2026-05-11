import { useEffect, useState } from 'react'
import { FiCalendar, FiXCircle } from 'react-icons/fi'
import Navbar from '../../../shared/components/Navbar'
import { getCurrentUser } from '../../auth/authStorage'
import {
  extendBooking,
  getBookingsForGuest,
  subscribeToBookingsChange,
  updateBookingStatus,
} from '../bookingsStorage'
import type { Booking } from '../types'

function money(amount: number) {
  return `$${amount.toLocaleString()}`
}

function statusClasses(status: string) {
  if (status === 'CONFIRMED') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  if (status === 'CANCELLED') {
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return 'bg-amber-50 text-amber-700 border-amber-200'
}

export default function BookingsPage() {
  const currentUser = getCurrentUser()
  const [bookings, setBookings] = useState<Booking[]>(() =>
    currentUser?.role === 'GUEST' ? getBookingsForGuest(currentUser.id) : [],
  )
  const [checkoutByBooking, setCheckoutByBooking] = useState<Record<string, string>>({})
  const [messageByBooking, setMessageByBooking] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'GUEST') {
      return undefined
    }

    return subscribeToBookingsChange(() => setBookings(getBookingsForGuest(currentUser.id)))
  }, [currentUser])

  const refreshBookings = () => {
    if (currentUser?.role === 'GUEST') {
      setBookings(getBookingsForGuest(currentUser.id))
    }
  }

  const handleCancel = (bookingId: string) => {
    const result = updateBookingStatus(bookingId, 'CANCELLED')
    setMessageByBooking((messages) => ({
      ...messages,
      [bookingId]: result.success ? 'Booking cancelled.' : result.error,
    }))
    refreshBookings()
  }

  const handleExtend = (booking: Booking) => {
    const nextCheckOut = checkoutByBooking[booking.id] || booking.checkOut
    const result = extendBooking(booking.id, nextCheckOut)
    setMessageByBooking((messages) => ({
      ...messages,
      [booking.id]: result.success ? 'Booking dates updated.' : result.error,
    }))
    refreshBookings()
  }

  useEffect(() => {
    if (currentUser && currentUser.role !== 'GUEST') {
      window.location.assign('#/dashboard')
    }
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar variant="solid" />
        <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-6 py-16 text-center">
          <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-950">Login required</h1>
            <a
              href="#/login"
              className="mt-6 inline-flex rounded-lg bg-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
            >
              Login
            </a>
          </div>
        </main>
      </div>
    )
  }

  if (currentUser.role !== 'GUEST') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar variant="solid" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">
            Guest
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-950">Your bookings</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Review upcoming stays and requests for {currentUser.name}.
              </p>
            </div>
            <a
              href="#/listings"
              className="inline-flex rounded-lg bg-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
            >
              Book another stay
            </a>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {bookings.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">No bookings yet</h2>
              <a
                href="#/listings"
                className="mt-6 inline-flex rounded-lg bg-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
              >
                Explore stays
              </a>
            </div>
          ) : (
            bookings.map((booking) => {
              const firstPhoto = booking.listing.photos[0]

              return (
                <article key={booking.id} className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-[15rem_1fr]">
                  {firstPhoto && (
                    <img
                      src={firstPhoto.url}
                      alt={booking.listing.title}
                      className="h-56 w-full object-cover md:h-full"
                    />
                  )}
                  <div className="grid gap-5 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${statusClasses(booking.status)}`}>
                        {booking.status}
                      </span>
                      <h2 className="mt-4 text-2xl font-bold text-slate-950">{booking.listing.title}</h2>
                      <p className="mt-2 text-sm text-slate-500">{booking.listing.location}</p>
                      <p className="mt-4 text-sm font-medium text-slate-700">
                        {booking.checkIn} to {booking.checkOut}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 lg:min-w-44">
                      <p className="text-sm text-slate-500">Total</p>
                      <p className="mt-2 text-2xl font-bold text-slate-950">{money(booking.totalPrice)}</p>
                      <label className="mt-5 block">
                        <span className="text-xs font-semibold text-slate-600">Extend checkout</span>
                        <input
                          type="date"
                          min={booking.checkIn}
                          value={checkoutByBooking[booking.id] ?? booking.checkOut}
                          onChange={(event) => setCheckoutByBooking((dates) => ({
                            ...dates,
                            [booking.id]: event.target.value,
                          }))}
                          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#f97316]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleExtend(booking)}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#f97316] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#000000]"
                      >
                        <FiCalendar />
                        Extend
                      </button>
                      {booking.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => handleCancel(booking.id)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          <FiXCircle />
                          Cancel
                        </button>
                      )}
                      {messageByBooking[booking.id] && (
                        <p className="mt-3 text-xs font-semibold text-slate-600">{messageByBooking[booking.id]}</p>
                      )}
                      <a
                        href={`#/listings/${booking.listingId}`}
                        className="mt-5 inline-flex w-full justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        View stay
                      </a>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </section>
      </main>
    </div>
  )
}

