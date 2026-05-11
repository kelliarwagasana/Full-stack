import type { User } from '../../auth/types'
import { initials } from '../utils/dashboardUtils'

interface UserAvatarProps {
  user: Pick<User, 'name' | 'avatar'>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const baseClass = `${sizeClasses[size]} shrink-0 overflow-hidden rounded-full bg-slate-900 text-white ${className}`

  if (user.avatar) {
    return <img src={user.avatar} alt={user.name} className={`${baseClass} object-cover`} />
  }

  return (
    <span className={`${baseClass} flex items-center justify-center font-bold`}>
      {initials(user.name)}
    </span>
  )
}

