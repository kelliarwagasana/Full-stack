import { useCallback, useEffect, useState } from 'react'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { useOutletContext } from 'react-router-dom'
import type { DashboardOutletContext } from '../utils/dashboardUtils'
import { statusClasses } from '../utils/dashboardUtils'
import {
  getBookings,
  subscribeToBookingsChange,
  updateBookingStatus,
} from '../../bookings/bookingsStorage'
import type { Booking } from '../../bookings/types'

export default function BookingsPage() {
  const { dashboardData, currentUser, isAdmin } = useOutletContext<DashboardOutletContext>()
  const [bookings, setBookings] = useState<Booking[]>(dashboardData.visibleBookings)

  const refreshBookings = useCallback(() => {
    const allBookings = getBookings()
    setBookings(
      isAdmin
        ? allBookings
        : allBookings.filter((booking) => booking.listing.hostId === currentUser.id),
    )
  }, [currentUser.id, isAdmin])

  useEffect(() => {
    return subscribeToBookingsChange(refreshBookings)
  }, [refreshBookings])

  const handleStatusUpdate = (bookingId: string, status: Booking['status']) => {
    updateBookingStatus(bookingId, status)
    refreshBookings()
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Bookings</h2>
          <p className="mt-1 text-sm text-slate-500">{bookings.length} total booking{bookings.length === 1 ? '' : 's'}</p>
        </div>
      </div>
      <div className="overflow-hidden bg-[#f8fafc] px-3 py-3">
        {bookings.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-separate border-spacing-y-2 text-left text-sm whitespace-nowrap">
            <thead className="text-xs uppercase tracking-[0.16em] text-white">
              <tr className="bg-slate-950 shadow-sm">
                <th className="rounded-l-xl px-5 py-4 font-semibold">Stay</th>
                <th className="px-5 py-4 font-semibold">Guest</th>
                <th className="px-5 py-4 font-semibold">Dates</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Total</th>
                <th className="rounded-r-xl px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => {
                const firstPhoto = booking.listing.photos[0]

                return (
                  <tr
                    key={booking.id}
                    className={`shadow-sm transition hover:bg-[#fff7ed] ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#fff8f5]'
                    }`}
                  >
                    <td className="rounded-l-xl px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        {firstPhoto && (
                          <img
                            src={firstPhoto.url}
                            alt={booking.listing.title}
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="max-w-56 truncate font-semibold text-slate-950">{booking.listing.title}</p>
                          <p className="max-w-56 truncate text-xs text-slate-500">{booking.listing.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className="font-medium text-slate-900">{booking.guest.name}</span>
                      <span className="ml-2 text-xs text-slate-500">{booking.guest.email}</span>
                    </td>
                    <td className="px-5 py-4 align-middle text-slate-600">
                      {booking.checkIn}
                      <span className="mx-2 text-slate-400">to</span>
                      {booking.checkOut}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${statusClasses(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right align-middle font-bold text-slate-950">${booking.totalPrice}</td>
                    <td className="rounded-r-xl px-5 py-4 align-middle">
                      <div className="flex justify-end gap-2">
                        {booking.status === 'PENDING' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <FiCheckCircle />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              <FiXCircle />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </section>
  )
}

