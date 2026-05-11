import { FiEdit3, FiPlus } from 'react-icons/fi'
import { useOutletContext, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { DashboardOutletContext } from '../utils/dashboardUtils'
import type { Listing } from '../../listings/types'
import AddListingForm from '../components/AddListingForm'
import { useState } from 'react'

function AvailableListingsSection({
  listings,
  onUpdateListing,
}: {
  listings: Listing[]
  onUpdateListing: (listing: Listing) => void
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Available listings</h2>
            <p className="mt-1 text-sm text-slate-500">{listings.length} active stay{listings.length === 1 ? '' : 's'}</p>
          </div>
          <Link
            to="/listings"
            className="inline-flex w-fit rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Public view
          </Link>
        </div>

        <div className="overflow-hidden bg-[#f8fafc] px-3 py-3">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-y-2 text-left text-sm whitespace-nowrap">
            <thead className="text-xs uppercase tracking-[0.16em] text-white">
              <tr className="bg-slate-950 shadow-sm">
                <th className="rounded-l-xl px-5 py-4 font-semibold">Listing</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Guests</th>
                <th className="px-5 py-4 font-semibold">Host</th>
                <th className="px-5 py-4 text-right font-semibold">Price</th>
                <th className="rounded-r-xl px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing, index) => {
                const firstPhoto = listing.photos[0]

                return (
                  <tr
                    key={listing.id}
                    className={`shadow-sm transition hover:bg-[#fff7ed] ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#fff8f5]'
                    }`}
                  >
                    <td className="rounded-l-xl px-5 py-4">
                      <div className="flex items-center gap-3">
                        {firstPhoto && (
                          <img
                            src={firstPhoto.url}
                            alt={listing.title}
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="max-w-64 truncate font-semibold text-slate-950">{listing.title}</p>
                          <p className="max-w-64 truncate text-xs text-slate-500">{listing.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#f97316]">
                        {listing.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{listing.guest}</td>
                    <td className="px-5 py-4 text-slate-600">{listing.host.name}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-950">${listing.pricePerNight}</td>
                    <td className="rounded-r-xl px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onUpdateListing(listing)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-xs font-semibold text-[#f97316] transition hover:bg-[#ffe2dc]"
                        >
                          <FiEdit3 />
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ListingsPage() {
  const { dashboardData } = useOutletContext<DashboardOutletContext>()
  const [isAddingListing, setIsAddingListing] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  const handleAddListing = () => {
    setSelectedListing(null)
    setIsAddingListing(true)
  }

  const handleUpdateListing = (listing: Listing) => {
    setSelectedListing(listing)
    setIsAddingListing(true)
  }

  return (
    <div className="relative space-y-6">
      <section className="flex flex-col gap-3 rounded-2xl border border-[#eadfdb] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#292626]">Listings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage current stays and add new places when needed.</p>
        </div>
        <button
          type="button"
          onClick={handleAddListing}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
        >
          <FiPlus />
          Add listing
        </button>
      </section>

      <AnimatePresence>
        {isAddingListing && (
          <motion.div
            className="fixed inset-0 z-[80] bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="mx-auto h-full max-w-5xl overflow-y-auto rounded-3xl shadow-2xl shadow-slate-950/30"
              initial={{ opacity: 0, y: 36, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <AddListingForm
                key={selectedListing?.id ?? 'new-listing'}
                listing={selectedListing}
                onClose={() => {
                  setIsAddingListing(false)
                  setSelectedListing(null)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AvailableListingsSection listings={dashboardData.visibleListings} onUpdateListing={handleUpdateListing} />
    </div>
  )
}

