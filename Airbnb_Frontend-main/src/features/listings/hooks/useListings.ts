import { useMemo, useState } from 'react'
import { listingsData } from '../../../data/listings'
import type { ListingType } from '../types'

export function useListings() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'ALL' | ListingType>('ALL')

  const listings = useMemo(() => {
    const searchText = query.trim().toLowerCase()

    return listingsData.filter((listing) => {
      const matchesType = type === 'ALL' || listing.type === type
      const matchesQuery =
        searchText.length === 0 ||
        listing.title.toLowerCase().includes(searchText) ||
        listing.location.toLowerCase().includes(searchText) ||
        listing.amenities.some((amenity) => amenity.toLowerCase().includes(searchText))

      return matchesType && matchesQuery
    })
  }, [query, type])

  return {
    listings,
    query,
    setQuery,
    setType,
    type,
  }
}

