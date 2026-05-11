import { memo } from 'react'
import type { Listing } from '../types'
import SavedBadge from './SavedBadge'

interface ListingCardProps {
  listing: Listing
}

function ListingCard({ listing }: ListingCardProps) {
  const firstPhoto = listing.photos[0]
  const guestLabel = `${listing.guest} guest${listing.guest > 1 ? 's' : ''}`

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <a href={`#/listings/${listing.id}`} className="block h-full">
          {firstPhoto && (
            <img
              src={firstPhoto.url}
              alt={listing.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          )}
        </a>
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm shadow-slate-950/10">
          {listing.type}
        </span>
        <SavedBadge listingId={listing.id} className="absolute right-3 top-3" />
      </div>

      <div className="p-4">
        <div className="min-h-[4.5rem]">
          <a href={`#/listings/${listing.id}`} className="block">
            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-950">
              {listing.title}
            </h3>
            <p className="mt-1 truncate text-sm text-slate-500">{listing.location}</p>
          </a>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">{guestLabel}</p>
          <p className="text-base font-semibold text-slate-950">
            ${listing.pricePerNight}
            <span className="text-sm font-medium text-slate-500"> /night</span>
          </p>
        </div>
      </div>
    </article>
  )
}

export default memo(ListingCard)

