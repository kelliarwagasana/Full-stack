import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { FiMapPin, FiSearch, FiSend, FiZap } from 'react-icons/fi'
import { listingsData } from '../../../data/listings'
import Navbar from '../../../shared/components/Navbar'
import type { Listing, ListingType } from '../types'
import SavedBadge from '../components/SavedBadge'

type ExploreTab = 'ai' | 'map' | 'filters'

interface GeoPoint {
  lat: number
  lng: number
}

interface LocationOption extends GeoPoint {
  label: string
}

interface ListingWithDistance {
  listing: Listing
  distance: number
  score?: number
}

interface GoogleMapOptions {
  center: GeoPoint
  clickableIcons?: boolean
  disableDefaultUI?: boolean
  fullscreenControl?: boolean
  mapTypeControl?: boolean
  mapTypeId?: string
  rotateControl?: boolean
  scaleControl?: boolean
  streetViewControl?: boolean
  tilt?: number
  zoom: number
  zoomControl?: boolean
}

interface GoogleMap {
  fitBounds: (bounds: GoogleLatLngBounds) => void
  getZoom: () => number | undefined
  setMapTypeId: (mapTypeId: string) => void
  setOptions: (options: Partial<GoogleMapOptions>) => void
  setTilt: (tilt: number) => void
  setZoom: (zoom: number) => void
}

interface GoogleMarker {
  addListener: (eventName: string, callback: () => void) => void
  setMap: (map: GoogleMap | null) => void
}

interface GoogleInfoWindow {
  open: (options: { anchor: GoogleMarker; map: GoogleMap }) => void
}

interface GoogleLatLngBounds {
  extend: (point: GeoPoint) => void
}

interface GoogleMapsNamespace {
  InfoWindow: new (options: { content: string }) => GoogleInfoWindow
  LatLngBounds: new () => GoogleLatLngBounds
  Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap
  Marker: new (options: {
    icon?: string
    label?: string
    map: GoogleMap
    position: GeoPoint
    title?: string
  }) => GoogleMarker
  MapTypeId: {
    HYBRID: string
    ROADMAP: string
  }
}

declare global {
  interface Window {
    google?: {
      maps: GoogleMapsNamespace
    }
    googleMapsLoader?: Promise<GoogleMapsNamespace>
  }
}

const savedLocations: LocationOption[] = [
  { label: 'New York, USA', lat: 40.7128, lng: -74.006 },
  { label: 'Kigali, Rwanda', lat: -1.9441, lng: 30.0619 },
  { label: 'Lisbon, Portugal', lat: 38.7223, lng: -9.1393 },
  { label: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { label: 'Tulum, Mexico', lat: 20.2114, lng: -87.4654 },
  { label: 'Paris, France', lat: 48.8566, lng: 2.3522 },
]

const radiusOptions = [
  { label: '500 km', value: 500 },
  { label: '1,500 km', value: 1500 },
  { label: '3,000 km', value: 3000 },
  { label: '6,000 km', value: 6000 },
  { label: 'Any distance', value: 0 },
]

const listingTypes: Array<'ALL' | ListingType> = ['ALL', 'HOUSE', 'APARTMENT', 'VILLA', 'CABIN']
const defaultListingsPerPage = 5
const searchListingsPerPage = 15
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function distanceKm(from: GeoPoint, to: GeoPoint) {
  const earthRadiusKm = 6371
  const latDelta = toRadians(to.lat - from.lat)
  const lngDelta = toRadians(to.lng - from.lng)
  const fromLat = toRadians(from.lat)
  const toLat = toRadians(to.lat)
  const curve =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2)

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(curve), Math.sqrt(1 - curve))
}

function formatDistance(distance: number) {
  if (distance < 10) {
    return `${distance.toFixed(1)} km`
  }

  return `${Math.round(distance).toLocaleString()} km`
}

function formatType(type: 'ALL' | ListingType) {
  return type === 'ALL' ? 'All stays' : type.charAt(0) + type.slice(1).toLowerCase()
}

function getPromptMaxPrice(prompt: string) {
  const priceMatch = prompt.match(/(?:under|below|less than|max|budget)?\s*\$?\s*(\d{2,4})/i)
  return priceMatch ? Number(priceMatch[1]) : undefined
}

function scoreListingForPrompt(listing: Listing, prompt: string) {
  const normalizedPrompt = prompt.trim().toLowerCase()

  if (!normalizedPrompt) {
    return 1
  }

  const searchableText = [
    listing.title,
    listing.location,
    listing.type,
    listing.amenities.join(' '),
    `${listing.guest} guests`,
  ].join(' ').toLowerCase()
  const words = normalizedPrompt
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !['with', 'near', 'for', 'and', 'the', 'under'].includes(word))
  const maxPrice = getPromptMaxPrice(normalizedPrompt)
  const typeBoost = listingTypes
    .filter((type) => type !== 'ALL')
    .some((type) => normalizedPrompt.includes(type.toLowerCase()) && listing.type === type)
    ? 4
    : 0
  const wordScore = words.reduce((score, word) => score + (searchableText.includes(word) ? 2 : 0), 0)
  const priceScore = maxPrice && listing.pricePerNight <= maxPrice ? 3 : 0
  const guestScore = normalizedPrompt.includes('group') && listing.guest >= 4 ? 2 : 0
  const luxuryScore = normalizedPrompt.includes('luxury') && listing.pricePerNight > 300 ? 2 : 0
  const cheapScore = (normalizedPrompt.includes('cheap') || normalizedPrompt.includes('budget')) && listing.pricePerNight < 180 ? 2 : 0

  return wordScore + typeBoost + priceScore + guestScore + luxuryScore + cheapScore
}

export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('ai')
  const [aiPrompt, setAiPrompt] = useState('')
  const [hasAiSearched, setHasAiSearched] = useState(false)
  const [hasMapSearched, setHasMapSearched] = useState(false)
  const [query, setQuery] = useState('')
  const [mapQuery, setMapQuery] = useState('')
  const [selectedLocationLabel, setSelectedLocationLabel] = useState(savedLocations[0].label)
  const [currentLocation, setCurrentLocation] = useState<LocationOption | null>(null)
  const [radiusKm, setRadiusKm] = useState(3000)
  const [selectedType, setSelectedType] = useState<'ALL' | ListingType>('ALL')
  const [minGuests, setMinGuests] = useState(1)
  const [locationStatus, setLocationStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const selectedSavedLocation =
    savedLocations.find((location) => location.label === selectedLocationLabel) ?? savedLocations[0]
  const searchOrigin = currentLocation ?? selectedSavedLocation

  const mapResults = useMemo(() => {
    return listingsData
      .map((listing) => ({
        listing,
        distance: distanceKm(searchOrigin, listing.coordinates),
      }))
      .sort((first, second) => first.distance - second.distance)
  }, [searchOrigin])

  const filteredMapResults = useMemo(() => {
    const normalizedMapQuery = mapQuery.trim().toLowerCase()

    return mapResults.filter(({ listing, distance }) => {
      const matchesDistance = radiusKm === 0 || distance <= radiusKm
      const matchesQuery =
        normalizedMapQuery.length === 0 ||
        listing.title.toLowerCase().includes(normalizedMapQuery) ||
        listing.location.toLowerCase().includes(normalizedMapQuery) ||
        listing.type.toLowerCase().includes(normalizedMapQuery) ||
        listing.amenities.some((amenity) => amenity.toLowerCase().includes(normalizedMapQuery))

      return matchesDistance && matchesQuery
    })
  }, [mapQuery, mapResults, radiusKm])

  const filterResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return mapResults.filter(({ listing }) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.location.toLowerCase().includes(normalizedQuery) ||
        listing.type.toLowerCase().includes(normalizedQuery) ||
        listing.amenities.some((amenity) => amenity.toLowerCase().includes(normalizedQuery))
      const matchesType = selectedType === 'ALL' || listing.type === selectedType
      const matchesGuests = listing.guest >= minGuests

      return matchesQuery && matchesType && matchesGuests
    })
  }, [mapResults, minGuests, query, selectedType])

  const aiResults = useMemo(() => {
    const scored = mapResults
      .map((result) => ({
        ...result,
        score: scoreListingForPrompt(result.listing, aiPrompt),
      }))
      .filter((result) => (aiPrompt.trim() ? (result.score ?? 0) > 0 : true))
      .sort((first, second) => (second.score ?? 0) - (first.score ?? 0) || first.distance - second.distance)

    return scored.length ? scored : mapResults.slice(0, 6)
  }, [aiPrompt, mapResults])

  const activeResults =
    activeTab === 'ai'
      ? hasAiSearched
        ? aiResults
        : []
      : activeTab === 'map'
        ? hasMapSearched
          ? filteredMapResults
          : []
        : filterResults
  const nearestResult = mapResults[0]
  const pageSize = activeTab === 'filters' ? searchListingsPerPage : defaultListingsPerPage
  const totalPages = Math.max(1, Math.ceil(activeResults.length / pageSize))
  const currentPageResults = activeResults.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const mapDisplayResults = hasMapSearched ? filteredMapResults : mapResults
  const shouldShowResults = !(activeTab === 'ai' && !hasAiSearched)

  const handleTabChange = (tab: ExploreTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleSearch = (searchMode: 'ai' | 'map') => {
    if (searchMode === 'ai') {
      setHasAiSearched(true)
    } else {
      setHasMapSearched(true)
    }
    setCurrentPage(1)
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Your browser does not support location detection.')
      return
    }

    setLocationStatus('Finding your location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          label: 'Current location',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setActiveTab('map')
        setHasMapSearched(true)
        setLocationStatus('Using your current location.')
      },
      () => {
        setLocationStatus('Location permission was not allowed. Choose a city instead.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleClearFilters = () => {
    setQuery('')
    setMapQuery('')
    setRadiusKm(3000)
    setSelectedType('ALL')
    setMinGuests(1)
    setCurrentLocation(null)
    setSelectedLocationLabel(savedLocations[0].label)
    setLocationStatus('')
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar variant="solid" />

      <main>
        <section className="border-b-2 border-black bg-white px-5 pb-10 pt-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-6 flex max-w-2xl justify-center gap-2 border-2 border-black bg-white p-1 text-xs font-black uppercase tracking-[0.14em] text-black">
              {[
                { id: 'filters', label: 'Search stays', icon: FiSearch },
                { id: 'ai', label: 'AI search', icon: FiZap },
                { id: 'map', label: 'Nearest', icon: FiMapPin },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id as ExploreTab)}
                    className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 transition ${
                      isActive
                        ? 'bg-black text-white'
                        : 'bg-white text-black/55 hover:bg-[#fff7ed] hover:text-[#f97316]'
                    }`}
                  >
                    <Icon />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="mx-auto max-w-4xl">
              {activeTab === 'ai' && (
                <AiPromptPanel
                  aiPrompt={aiPrompt}
                  isCompact={hasAiSearched}
                  onPromptChange={(prompt) => {
                    setAiPrompt(prompt)
                    setHasAiSearched(false)
                    setCurrentPage(1)
                  }}
                  onSearch={() => handleSearch('ai')}
                />
              )}

              {activeTab === 'map' && (
                <MapSearchPanel
                  mapQuery={mapQuery}
                  selectedLocationLabel={selectedLocationLabel}
                  currentLocation={currentLocation}
                  radiusKm={radiusKm}
                  locationStatus={locationStatus}
                  onMapQueryChange={(value) => {
                    setMapQuery(value)
                    setHasMapSearched(false)
                    setCurrentPage(1)
                  }}
                  onLocationChange={(label) => {
                    setCurrentLocation(null)
                    setSelectedLocationLabel(label)
                    setLocationStatus('')
                    setHasMapSearched(false)
                    setCurrentPage(1)
                  }}
                  onRadiusChange={setRadiusKm}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  onSearch={() => handleSearch('map')}
                />
              )}

              {activeTab === 'filters' && (
                <FilterPanel
                  query={query}
                  selectedType={selectedType}
                  minGuests={minGuests}
                  onQueryChange={(value) => {
                    setQuery(value)
                    setCurrentPage(1)
                  }}
                  onTypeChange={(value) => {
                    setSelectedType(value)
                    setCurrentPage(1)
                  }}
                  onGuestsChange={(value) => {
                    setMinGuests(value)
                    setCurrentPage(1)
                  }}
                  onClear={handleClearFilters}
                />
              )}
            </div>
          </div>
        </section>

        {shouldShowResults && (
        <section className="mx-auto max-w-7xl px-5 py-12">
          <div className="mb-8 grid gap-4 border-b-2 border-black pb-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-black">ListOn Edit</h1>
                <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#f97316] text-lg font-black text-white">{'>'}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-black/55">
                {activeResults.length} selected stay{activeResults.length === 1 ? '' : 's'} from the marketplace
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-black disabled:opacity-40"
              >
                {'<'}
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#f97316] text-white disabled:opacity-40"
              >
                {'>'}
              </button>
            </div>
          </div>

          {activeTab === 'map' && (
            <MapPreview
              origin={searchOrigin}
              results={mapDisplayResults.slice(0, 12)}
              nearestResult={nearestResult}
            />
          )}

          {currentPageResults.length === 0 ? (
            <EmptyResults
              nearestResult={nearestResult}
              message={
                activeTab === 'ai' && !hasAiSearched
                  ? 'Enter an AI prompt to see matching listings.'
                  : activeTab === 'map' && !hasMapSearched
                    ? 'Search nearest listings by property name, type, or place.'
                    : 'No stays found'
              }
            />
          ) : (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentPageResults.map((result) => (
                <ExploreListingCard
                  key={result.listing.id}
                  result={result}
                  isNearest={nearestResult?.listing.id === result.listing.id}
                  showScore={activeTab === 'ai'}
                />
              ))}
            </div>
          )}

          {activeResults.length > pageSize && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="border-2 border-black px-5 py-2 text-sm font-black text-black transition hover:bg-[#fff7ed] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm font-black text-black/55">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="border-2 border-black px-5 py-2 text-sm font-black text-black transition hover:bg-[#fff7ed] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
        )}
      </main>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function buildMapBounds(points: GeoPoint[]) {
  const latValues = points.map((point) => point.lat)
  const lngValues = points.map((point) => point.lng)
  const minLat = Math.min(...latValues)
  const maxLat = Math.max(...latValues)
  const minLng = Math.min(...lngValues)
  const maxLng = Math.max(...lngValues)
  const latPadding = Math.max((maxLat - minLat) * 0.2, 2)
  const lngPadding = Math.max((maxLng - minLng) * 0.2, 2)

  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding,
  }
}

function markerStyle(point: GeoPoint, bounds: ReturnType<typeof buildMapBounds>): CSSProperties {
  const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100
  const y = ((bounds.maxLat - point.lat) / (bounds.maxLat - bounds.minLat)) * 100

  return {
    left: `${clamp(x, 6, 94)}%`,
    top: `${clamp(y, 8, 92)}%`,
  }
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps)
  }

  if (window.googleMapsLoader) {
    return window.googleMapsLoader
  }

  window.googleMapsLoader = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps-loader="true"]')

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.google?.maps) {
          resolve(window.google.maps)
        } else {
          reject(new Error('Google Maps script loaded without maps namespace.'))
        }
      })
      existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed to load.')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`
    script.async = true
    script.defer = true
    script.dataset.googleMapsLoader = 'true'
    script.addEventListener('load', () => {
      if (window.google?.maps) {
        resolve(window.google.maps)
      } else {
        reject(new Error('Google Maps script loaded without maps namespace.'))
      }
    })
    script.addEventListener('error', () => reject(new Error('Google Maps script failed to load.')))
    document.head.appendChild(script)
  })

  return window.googleMapsLoader
}

function priceMarkerIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><path fill="${color}" d="M22 2C14.3 2 8 8.3 8 16c0 10.5 14 26 14 26s14-15.5 14-26C36 8.3 29.7 2 22 2Z"/><circle cx="22" cy="16" r="7" fill="white"/></svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function listingInfoContent(result: ListingWithDistance) {
  return `
    <div style="max-width:220px;font-family:Inter,Arial,sans-serif">
      <strong style="display:block;margin-bottom:4px;color:#0f172a">${result.listing.title}</strong>
      <span style="display:block;color:#64748b">${result.listing.location}</span>
      <span style="display:block;margin-top:6px;color:#f97316;font-weight:700">$${result.listing.pricePerNight} night</span>
      <span style="display:block;margin-top:4px;color:#475569">${formatDistance(result.distance)} away</span>
    </div>
  `
}

function AiPromptPanel({
  aiPrompt,
  isCompact,
  onPromptChange,
  onSearch,
}: {
  aiPrompt: string
  isCompact: boolean
  onPromptChange: (prompt: string) => void
  onSearch: () => void
}) {
  return (
    <div className={isCompact ? 'mx-auto max-w-2xl' : ''}>
      <div className={`flex flex-col overflow-hidden border-2 border-black bg-white shadow-[8px_8px_0_#f97316] md:flex-row md:items-center ${
        isCompact ? 'shadow-[5px_5px_0_#f97316]' : ''
      }`}>
        <label className={`flex flex-1 flex-col ${isCompact ? 'px-6 py-3' : 'px-8 py-4'}`}>
          <span className="text-xs font-black uppercase tracking-[0.16em] text-black">AI prompt</span>
          <input
            value={aiPrompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="Tell AI what kind of stay you need"
            className="mt-1 w-full bg-transparent text-sm font-semibold text-black outline-none placeholder:text-black/40"
          />
        </label>
        <button
          type="button"
          onClick={onSearch}
          disabled={!aiPrompt.trim()}
          className={`${isCompact ? 'h-11 w-11' : 'h-14 w-14'} m-2 inline-flex shrink-0 items-center justify-center bg-[#f97316] text-xl text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <FiSend />
        </button>
      </div>
    </div>
  )
}

function MapSearchPanel({
  mapQuery,
  selectedLocationLabel,
  currentLocation,
  radiusKm,
  locationStatus,
  onMapQueryChange,
  onLocationChange,
  onRadiusChange,
  onUseCurrentLocation,
  onSearch,
}: {
  mapQuery: string
  selectedLocationLabel: string
  currentLocation: LocationOption | null
  radiusKm: number
  locationStatus: string
  onMapQueryChange: (value: string) => void
  onLocationChange: (label: string) => void
  onRadiusChange: (radius: number) => void
  onUseCurrentLocation: () => void
  onSearch: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col overflow-hidden border-2 border-black bg-white shadow-[8px_8px_0_#f97316] md:flex-row md:items-center">
        <label className="flex flex-1 flex-col px-8 py-4">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-black">Search</span>
          <input
            value={mapQuery}
            onChange={(event) => onMapQueryChange(event.target.value)}
            placeholder="Property name, type, or place"
            className="mt-1 w-full bg-transparent text-sm font-semibold text-black outline-none placeholder:text-black/40"
          />
        </label>
        <div className="hidden h-10 w-0.5 bg-black md:block" />
        <label className="flex flex-1 flex-col px-8 py-4">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-black">Where</span>
          <select
            value={currentLocation ? 'Current location' : selectedLocationLabel}
            onChange={(event) => onLocationChange(event.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-semibold text-black outline-none"
          >
            {currentLocation && <option>Current location</option>}
            {savedLocations.map((location) => (
              <option key={location.label}>{location.label}</option>
            ))}
          </select>
        </label>
        <div className="hidden h-10 w-0.5 bg-black md:block" />
        <label className="flex flex-1 flex-col px-8 py-4">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-black">Distance</span>
          <select
            value={radiusKm}
            onChange={(event) => onRadiusChange(Number(event.target.value))}
            className="mt-1 w-full bg-transparent text-sm font-semibold text-black outline-none"
          >
            {radiusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="hidden h-8 w-px bg-slate-200 md:block" />
        <button
          type="button"
          onClick={onUseCurrentLocation}
          className="mx-3 inline-flex items-center gap-2 text-sm font-black text-[#f97316]"
        >
          <FiMapPin />
          Use location
        </button>
        <button
          type="button"
          onClick={onSearch}
          className="m-2 inline-flex h-14 w-14 shrink-0 items-center justify-center bg-[#f97316] text-xl text-white transition hover:bg-black"
        >
          <FiSearch />
        </button>
      </div>

      {locationStatus && (
        <p className="border-2 border-[#f97316] bg-[#fff7ed] px-4 py-3 text-sm font-bold text-black">
          {locationStatus}
        </p>
      )}
    </div>
  )
}

function FilterPanel({
  query,
  selectedType,
  minGuests,
  onQueryChange,
  onTypeChange,
  onGuestsChange,
  onClear,
}: {
  query: string
  selectedType: 'ALL' | ListingType
  minGuests: number
  onQueryChange: (query: string) => void
  onTypeChange: (type: 'ALL' | ListingType) => void
  onGuestsChange: (guests: number) => void
  onClear: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col overflow-hidden border-2 border-black bg-white shadow-[8px_8px_0_#f97316] md:flex-row md:items-center">
        <label className="flex flex-1 flex-col px-8 py-4">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-black">Where</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Property name, type, or place"
            type="search"
            className="mt-1 w-full bg-transparent text-sm font-semibold text-black outline-none placeholder:text-black/40"
          />
        </label>
        <div className="hidden h-10 w-0.5 bg-black md:block" />
        <label className="flex flex-1 flex-col px-8 py-4">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-black">Type</span>
          <select
            value={selectedType}
            onChange={(event) => onTypeChange(event.target.value as 'ALL' | ListingType)}
            className="mt-1 w-full bg-transparent text-sm font-semibold text-black outline-none"
          >
            {listingTypes.map((type) => (
              <option key={type} value={type}>
                {formatType(type)}
              </option>
            ))}
          </select>
        </label>
        <div className="hidden h-10 w-0.5 bg-black md:block" />
        <label className="flex flex-1 flex-col px-8 py-4">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-black">Who</span>
          <input
            type="number"
            min={1}
            max={12}
            value={minGuests}
            onChange={(event) => onGuestsChange(Number(event.target.value))}
            className="mt-1 w-full bg-transparent text-sm font-semibold text-black outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => undefined}
          className="m-2 inline-flex h-14 w-14 shrink-0 items-center justify-center bg-[#f97316] text-xl text-white transition hover:bg-black"
        >
          <FiSearch />
        </button>
      </div>
      <div className="mx-auto flex max-w-2xl justify-center">
        <button
          type="button"
          onClick={onClear}
          className="border-2 border-black bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-[#fff7ed]"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

function MapPreview({
  origin,
  results,
  nearestResult,
}: {
  origin: GeoPoint
  results: ListingWithDistance[]
  nearestResult?: ListingWithDistance
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapMode, setMapMode] = useState<'2d' | '3d'>('2d')
  const [mapStatus, setMapStatus] = useState(googleMapsApiKey ? 'Loading Google map...' : 'Google map key is missing.')
  const bounds = buildMapBounds([origin, ...results.map((result) => result.listing.coordinates)])

  useEffect(() => {
    if (!googleMapsApiKey || !mapRef.current) {
      return undefined
    }

    let cancelled = false
    const markers: GoogleMarker[] = []

    loadGoogleMaps(googleMapsApiKey)
      .then((maps) => {
        if (cancelled || !mapRef.current) {
          return
        }

        const map = new maps.Map(mapRef.current, {
          center: origin,
          clickableIcons: true,
          disableDefaultUI: false,
          fullscreenControl: true,
          mapTypeControl: true,
          mapTypeId: mapMode === '3d' ? maps.MapTypeId.HYBRID : maps.MapTypeId.ROADMAP,
          rotateControl: true,
          scaleControl: true,
          streetViewControl: true,
          tilt: mapMode === '3d' ? 45 : 0,
          zoom: 12,
          zoomControl: true,
        })
        const googleBounds = new maps.LatLngBounds()

        googleBounds.extend(origin)
        const userMarker = new maps.Marker({
          icon: priceMarkerIcon('#111827'),
          label: 'Y',
          map,
          position: origin,
          title: 'Your search location',
        })
        markers.push(userMarker)

        results.forEach((result, index) => {
          googleBounds.extend(result.listing.coordinates)
          const isNearest = nearestResult?.listing.id === result.listing.id
          const marker = new maps.Marker({
            icon: priceMarkerIcon(isNearest ? '#f97316' : '#0f172a'),
            label: String(index + 1),
            map,
            position: result.listing.coordinates,
            title: result.listing.title,
          })
          const infoWindow = new maps.InfoWindow({
            content: listingInfoContent(result),
          })

          marker.addListener('click', () => infoWindow.open({ anchor: marker, map }))
          markers.push(marker)
        })

        map.fitBounds(googleBounds)
        if (mapMode === '3d') {
          map.setOptions({ tilt: 45 })
          map.setMapTypeId(maps.MapTypeId.HYBRID)
          if ((map.getZoom() ?? 0) < 17 && results.length <= 3) {
            map.setZoom(17)
          }
        }
        setMapStatus('')
      })
      .catch(() => {
        if (!cancelled) {
          setMapStatus('Google map could not load. Check that Maps JavaScript API is enabled for your key.')
        }
      })

    return () => {
      cancelled = true
      markers.forEach((marker) => marker.setMap(null))
    }
  }, [mapMode, nearestResult?.listing.id, origin, results])

  return (
    <div className="mb-8 overflow-hidden border-2 border-black bg-white shadow-[8px_8px_0_#f97316]">
      <div className="relative h-[28rem] overflow-hidden bg-[#fff7ed]">
        {googleMapsApiKey ? (
          <div ref={mapRef} className="absolute inset-0" aria-label="Interactive Google map showing nearby listings" />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute left-[-8%] top-[22%] h-4 w-[120%] rotate-[-12deg] bg-white/80" />
            <div className="absolute left-[-10%] top-[58%] h-4 w-[120%] rotate-[10deg] bg-white/70" />
            <div className="absolute left-[32%] top-[-10%] h-[120%] w-4 rotate-[16deg] bg-white/70" />
            <div className="absolute left-[68%] top-[-8%] h-[120%] w-3 rotate-[-18deg] bg-white/60" />
            <div className="absolute left-[5%] top-[8%] h-32 w-52 border-2 border-black bg-[#f97316]/30" />
            <div className="absolute right-[8%] bottom-[12%] h-44 w-64 border-2 border-black bg-white/70" />
          </div>
        )}

        {mapStatus && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 text-sm font-black text-black backdrop-blur-sm">
            {mapStatus}
          </div>
        )}

        <div className="pointer-events-none absolute left-5 top-5 z-20 border-2 border-black bg-white/95 px-5 py-4 shadow-[6px_6px_0_#f97316] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f97316]">
            {googleMapsApiKey ? 'Google map' : 'Nearest map'}
          </p>
          <h2 className="mt-1 text-lg font-black text-black">
            {results.length} listing{results.length === 1 ? '' : 's'} on map
          </h2>
        </div>

        {googleMapsApiKey && (
          <div className="absolute right-5 top-5 z-20 flex border-2 border-black bg-white p-1 shadow-lg">
            {(['2d', '3d'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setMapMode(mode)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                  mapMode === mode ? 'bg-[#f97316] text-white' : 'text-black/60 hover:bg-[#fff7ed]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {!googleMapsApiKey && (
          <>
            <div
              className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center border-2 border-black bg-white px-3 py-2 text-xs font-black text-black shadow-lg"
              style={markerStyle(origin, bounds)}
            >
              You
            </div>

            {results.map((result) => {
              const isNearest = nearestResult?.listing.id === result.listing.id

              return (
                <a
                  key={result.listing.id}
                  href={`#/listings/${result.listing.id}`}
                  style={markerStyle(result.listing.coordinates, bounds)}
                  className={`absolute z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold shadow-lg transition hover:scale-105 ${
                    isNearest ? 'bg-[#f97316] text-white' : 'bg-black text-white'
                  }`}
                  title={result.listing.title}
                >
                  ${result.listing.pricePerNight}
                  <span className="rounded-full bg-white/20 px-2 py-0.5">{formatDistance(result.distance)}</span>
                </a>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyResults({
  nearestResult,
  message = 'No stays found',
}: {
  nearestResult?: ListingWithDistance
  message?: string
}) {
  return (
    <div className="border-2 border-black bg-white p-8 text-center shadow-[8px_8px_0_#f97316]">
      <h2 className="text-xl font-black text-black">{message}</h2>
      {message === 'No stays found' && nearestResult && (
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-black/55">
          The nearest listing is {nearestResult.listing.title} at {formatDistance(nearestResult.distance)}.
          Try widening the search.
        </p>
      )}
    </div>
  )
}

function ExploreListingCard({
  result,
  isNearest,
  showScore,
}: {
  result: ListingWithDistance
  isNearest: boolean
  showScore: boolean
}) {
  const firstPhoto = result.listing.photos[0]

  return (
    <article className="group relative bg-white">
      <a href={`#/listings/${result.listing.id}`} className="block">
        <div className="relative aspect-[5/4] overflow-hidden border-2 border-black bg-black">
          {firstPhoto && (
            <img
              src={firstPhoto.url}
              alt={result.listing.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2 text-[11px]">
            <span className="border border-black bg-white px-3 py-1 font-black uppercase tracking-[0.12em] text-black">
              Edit
            </span>
            {isNearest && (
              <span className="bg-[#f97316] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm">
                Nearest
              </span>
            )}
            {showScore && (
              <span className="bg-black px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm">
                AI match {result.score ?? 0}
              </span>
            )}
          </div>
        </div>
        <div className="border-x-2 border-b-2 border-black bg-white p-3 transition group-hover:shadow-[6px_6px_0_#f97316]">
          <h3 className="line-clamp-2 text-sm font-black leading-5 text-black">{result.listing.title}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-black/55">{result.listing.location}</p>
          <p className="mt-1 text-sm font-semibold text-black/55">Coming May 20</p>
          <p className="mt-2 inline-flex bg-[#f97316] px-2 py-1 text-sm font-black text-white">${result.listing.pricePerNight} night</p>
        </div>
      </a>
      <SavedBadge listingId={result.listing.id} className="absolute right-3 top-3 bg-white/90" />
    </article>
  )
}


