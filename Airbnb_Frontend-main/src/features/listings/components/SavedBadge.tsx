import styles from './ListingCard.module.css'
import { useFavorites } from '../hooks/useFavorites'

interface SavedBadgeProps {
  listingId: string
  className?: string
}

export default function SavedBadge({ listingId, className = '' }: SavedBadgeProps) {
  const { currentUser, isFavorite, toggleFavorite } = useFavorites()
  const isSaved = isFavorite(listingId)
  const isHiddenForRole = currentUser?.role === 'ADMIN' || currentUser?.role === 'HOST'

  if (isHiddenForRole) {
    return null
  }

  return (
    <button
      type="button"
      aria-label={isSaved ? 'Remove saved listing' : 'Save listing'}
      title={isSaved ? 'Saved' : 'Save'}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(listingId)
      }}
      className={`${styles.saveButton} ${isSaved ? styles.saveButtonActive : ''} ${className}`}
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill={isSaved ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5.75C5 4.78 5.78 4 6.75 4h10.5c.97 0 1.75.78 1.75 1.75V20l-7-4-7 4V5.75z"
        />
      </svg>
    </button>
  )
}

