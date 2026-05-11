import type { ListingType } from '../types'

interface SearchBarProps {
  query: string
  type: 'ALL' | ListingType
  onQueryChange: (query: string) => void
  onTypeChange: (type: 'ALL' | ListingType) => void
}

const listingTypes: Array<'ALL' | ListingType> = ['ALL', 'HOUSE', 'APARTMENT', 'VILLA', 'CABIN']

export default function SearchBar({ query, type, onQueryChange, onTypeChange }: SearchBarProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_14rem]">
      <label className="rounded-lg bg-slate-50 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Search</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="City, title, amenity..."
          className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
        />
      </label>
      <label className="rounded-lg bg-slate-50 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Type</span>
        <select
          value={type}
          onChange={(event) => onTypeChange(event.target.value as 'ALL' | ListingType)}
          className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
        >
          {listingTypes.map((listingType) => (
            <option key={listingType} value={listingType}>
              {listingType === 'ALL' ? 'All stays' : listingType}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

