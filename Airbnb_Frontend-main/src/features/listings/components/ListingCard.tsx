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
    <article className="group overflow-hidden border-2 border-black bg-white transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#f97316]">
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        <a href={`#/listings/${listing.id}`} className="block h-full">
          {firstPhoto && (
            <img
              src={firstPhoto.url}
              alt={listing.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          )}
        </a>
        <span className="absolute left-3 top-3 border border-black bg-white px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-black">
          {listing.type}
        </span>
        <SavedBadge listingId={listing.id} className="absolute right-3 top-3" />
      </div>

      <div className="p-4">
        <div className="min-h-[4.5rem]">
          <a href={`#/listings/${listing.id}`} className="block">
            <h3 className="line-clamp-2 text-base font-black leading-6 text-black">
              {listing.title}
            </h3>
            <p className="mt-1 truncate text-sm font-semibold text-black/55">{listing.location}</p>
          </a>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t-2 border-black pt-4">
          <p className="text-sm font-semibold text-black/55">{guestLabel}</p>
          <p className="bg-[#f97316] px-2 py-1 text-base font-black text-white">
            ${listing.pricePerNight}
            <span className="text-sm font-semibold text-white/80"> /night</span>
          </p>
        </div>
      </div>
    </article>
  )
}

export default memo(ListingCard)

