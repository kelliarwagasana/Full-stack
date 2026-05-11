import { useEffect, useMemo, useState } from 'react'
import { listingsData } from '../../../data/listings'
import { getCurrentUser, subscribeToAuthChange } from '../../auth/authStorage'
import type { User } from '../../auth/types'

const FAVORITES_CHANGE_EVENT = 'liston-favorites-change'

function getFavoritesKey(userId: string) {
  return `liston.favorites.${userId}`
}

function readFavoriteIds(user: User | null) {
  if (!user || user.role !== 'GUEST') {
    return []
  }

  const savedValue = window.localStorage.getItem(getFavoritesKey(user.id))

  if (!savedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(savedValue) as string[]
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function writeFavoriteIds(user: User, listingIds: string[]) {
  window.localStorage.setItem(getFavoritesKey(user.id), JSON.stringify(listingIds))
  window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT))
}

export function useFavorites() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser())
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readFavoriteIds(getCurrentUser()))

  useEffect(() => {
    const refreshFavorites = () => {
      const user = getCurrentUser()
      setCurrentUser(user)
      setFavoriteIds(readFavoriteIds(user))
    }

    const unsubscribeAuth = subscribeToAuthChange(refreshFavorites)
    window.addEventListener(FAVORITES_CHANGE_EVENT, refreshFavorites)
    window.addEventListener('storage', refreshFavorites)

    return () => {
      unsubscribeAuth()
      window.removeEventListener(FAVORITES_CHANGE_EVENT, refreshFavorites)
      window.removeEventListener('storage', refreshFavorites)
    }
  }, [])

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds])
  const savedListings = useMemo(
    () => listingsData.filter((listing) => favoriteIdSet.has(listing.id)),
    [favoriteIdSet],
  )

  const isFavorite = (listingId: string) => favoriteIdSet.has(listingId)

  const toggleFavorite = (listingId: string) => {
    const user = getCurrentUser()

    if (!user) {
      window.location.assign('#/login')
      return
    }

    if (user.role !== 'GUEST') {
      return
    }

    const nextFavoriteIds = favoriteIdSet.has(listingId)
      ? favoriteIds.filter((id) => id !== listingId)
      : [listingId, ...favoriteIds]

    writeFavoriteIds(user, nextFavoriteIds)
    setFavoriteIds(nextFavoriteIds)
  }

  return {
    canSave: currentUser?.role === 'GUEST',
    currentUser,
    favoriteIds,
    isFavorite,
    savedListings,
    toggleFavorite,
  }
}

