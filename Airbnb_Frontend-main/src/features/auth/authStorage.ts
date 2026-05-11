import { seedAuthUsers } from '../../data/users'
import type {
  AuthResult,
  LoginCredentials,
  RegisterCredentials,
  StoredAuthUser,
  User,
} from './types'

const AUTH_USERS_KEY = 'liston.auth.users'
const AUTH_CURRENT_USER_KEY = 'liston.auth.currentUser'
export const AUTH_CHANGE_EVENT = 'liston-auth-change'

function toPublicUser(user: StoredAuthUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    avatar: user.avatar,
    avatarPublicId: user.avatarPublicId,
    isActive: user.isActive ?? true,
    role: user.role,
    createdAt: user.createdAt,
  }
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function readUsers(): StoredAuthUser[] {
  const storage = getStorage()

  if (!storage) {
    return seedAuthUsers
  }

  const savedUsers = storage.getItem(AUTH_USERS_KEY)

  if (!savedUsers) {
    storage.setItem(AUTH_USERS_KEY, JSON.stringify(seedAuthUsers))
    return seedAuthUsers
  }

  try {
    const users = JSON.parse(savedUsers) as StoredAuthUser[]
    const storedUsers = Array.isArray(users) ? users : []
    const userMap = new Map(storedUsers.map((user) => [user.email.toLowerCase(), user]))

    seedAuthUsers.forEach((seedUser) => {
      const key = seedUser.email.toLowerCase()
      userMap.set(key, { ...seedUser, ...userMap.get(key) })
    })

    const mergedUsers = Array.from(userMap.values())
    writeUsers(mergedUsers)
    return mergedUsers
  } catch {
    storage.setItem(AUTH_USERS_KEY, JSON.stringify(seedAuthUsers))
    return seedAuthUsers
  }
}

function writeUsers(users: StoredAuthUser[]) {
  getStorage()?.setItem(AUTH_USERS_KEY, JSON.stringify(users))
}

function announceAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

function setCurrentUser(user: User) {
  getStorage()?.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(user))
  announceAuthChange()
}

export function getCurrentUser(): User | null {
  const savedUser = getStorage()?.getItem(AUTH_CURRENT_USER_KEY)

  if (!savedUser) {
    return null
  }

  try {
    return JSON.parse(savedUser) as User
  } catch {
    getStorage()?.removeItem(AUTH_CURRENT_USER_KEY)
    return null
  }
}

export function getAuthUsers(): User[] {
  return readUsers().map(toPublicUser)
}

export function updateUserStatus(userId: string, isActive: boolean) {
  const users = readUsers()
  const nextUsers = users.map((user) => (
    user.id === userId ? { ...user, isActive } : user
  ))

  writeUsers(nextUsers)

  const currentUser = getCurrentUser()
  if (currentUser?.id === userId) {
    if (isActive) {
      setCurrentUser({ ...currentUser, isActive })
    } else {
      getStorage()?.removeItem(AUTH_CURRENT_USER_KEY)
      announceAuthChange()
    }
    return
  }

  announceAuthChange()
}

export function becomeHost(userId: string) {
  const users = readUsers()
  const user = users.find((item) => item.id === userId)

  if (!user) {
    return { success: false, error: 'User not found.' } as const
  }

  if (user.role === 'HOST' || user.role === 'ADMIN') {
    return { success: false, error: 'This account already has host access.' } as const
  }

  const nextUsers = users.map((item) => (
    item.id === userId ? { ...item, role: 'HOST' as const } : item
  ))
  const updatedUser = nextUsers.find((item) => item.id === userId)

  if (!updatedUser) {
    return { success: false, error: 'User not found.' } as const
  }

  writeUsers(nextUsers)
  const publicUser = toPublicUser(updatedUser)
  const currentUser = getCurrentUser()

  if (currentUser?.id === userId) {
    setCurrentUser(publicUser)
  } else {
    announceAuthChange()
  }

  return { success: true, user: publicUser } as const
}

export function updateProfile(
  userId: string,
  profile: Pick<User, 'name' | 'username' | 'phone'> & { avatar?: string },
) {
  const name = profile.name.trim()
  const username = profile.username.trim()
  const phone = profile.phone.trim()
  const avatar = profile.avatar?.trim()

  if (!name || !username || !phone) {
    return { success: false, error: 'Please fill in name, username, and phone.' } as const
  }

  const users = readUsers()
  const usernameExists = users.some(
    (user) => user.id !== userId && user.username.toLowerCase() === username.toLowerCase(),
  )

  if (usernameExists) {
    return { success: false, error: 'That username is already in use.' } as const
  }

  const nextUsers = users.map((user) => (
    user.id === userId
      ? {
          ...user,
          name,
          username,
          phone,
          avatar: avatar || undefined,
        }
      : user
  ))
  const updatedUser = nextUsers.find((user) => user.id === userId)

  if (!updatedUser) {
    return { success: false, error: 'User not found.' } as const
  }

  writeUsers(nextUsers)

  const publicUser = toPublicUser(updatedUser)
  const currentUser = getCurrentUser()
  if (currentUser?.id === userId) {
    setCurrentUser(publicUser)
  } else {
    announceAuthChange()
  }

  return { success: true, user: publicUser } as const
}

export function login(credentials: LoginCredentials): AuthResult {
  const email = credentials.email.trim().toLowerCase()
  const password = credentials.password
  const user = readUsers().find((item) => item.email.toLowerCase() === email)

  if (!user || user.password !== password) {
    return { success: false, error: 'Email or password is incorrect.' }
  }

  if (user.isActive === false) {
    return { success: false, error: 'This account has been deactivated.' }
  }

  const publicUser = toPublicUser(user)
  setCurrentUser(publicUser)
  return { success: true, user: publicUser }
}

export function loginWithGoogle(): AuthResult {
  const email = 'google.guest@example.com'
  const users = readUsers()
  const existingUser = users.find((user) => user.email.toLowerCase() === email)

  if (existingUser) {
    if (existingUser.isActive === false) {
      return { success: false, error: 'This Google account has been deactivated.' }
    }

    const publicUser = toPublicUser(existingUser)
    setCurrentUser(publicUser)
    return { success: true, user: publicUser }
  }

  const googleUser: StoredAuthUser = {
    id: `google-user-${Date.now()}`,
    name: 'Google Guest',
    email,
    username: 'googleGuest',
    phone: '+1-555-0300',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=160&q=80',
    role: 'GUEST',
    createdAt: new Date().toISOString(),
    password: `google-${Date.now()}`,
  }

  writeUsers([...users, googleUser])

  const publicUser = toPublicUser(googleUser)
  setCurrentUser(publicUser)
  return { success: true, user: publicUser }
}

export function getPostLoginPath(user: User) {
  return user.role === 'ADMIN' || user.role === 'HOST' ? '/dashboard' : '/listings'
}

export function register(credentials: RegisterCredentials): AuthResult {
  const name = credentials.name.trim()
  const email = credentials.email.trim().toLowerCase()
  const username = credentials.username.trim()
  const phone = credentials.phone.trim()
  const password = credentials.password
  const role = credentials.role === 'HOST' ? 'HOST' : 'GUEST'

  if (!name || !email || !username || !phone || !password) {
    return { success: false, error: 'Please fill in every field.' }
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' }
  }

  const users = readUsers()
  const accountExists = users.some(
    (user) =>
      user.email.toLowerCase() === email ||
      user.username.toLowerCase() === username.toLowerCase(),
  )

  if (accountExists) {
    return { success: false, error: 'An account with that email or username already exists.' }
  }

  const newUser: StoredAuthUser = {
    id: `auth-user-${Date.now()}`,
    name,
    email,
    username,
    phone,
    role,
    createdAt: new Date().toISOString(),
    password,
  }

  writeUsers([...users, newUser])

  const publicUser = toPublicUser(newUser)
  setCurrentUser(publicUser)
  return { success: true, user: publicUser }
}

export function logout() {
  getStorage()?.removeItem(AUTH_CURRENT_USER_KEY)
  announceAuthChange()
}

export function subscribeToAuthChange(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === AUTH_CURRENT_USER_KEY || event.key === AUTH_USERS_KEY) {
      callback()
    }
  }

  window.addEventListener(AUTH_CHANGE_EVENT, callback)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}

