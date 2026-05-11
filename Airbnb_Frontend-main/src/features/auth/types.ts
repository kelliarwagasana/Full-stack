export type Role = 'ADMIN' | 'GUEST' | 'HOST'
export type RegisterRole = 'GUEST' | 'HOST'

export interface User {
  id: string
  name: string
  email: string
  username: string
  phone: string
  avatar?: string
  avatarPublicId?: string
  isActive?: boolean
  role: Role
  createdAt: string
}

export interface StoredAuthUser extends User {
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  username: string
  phone: string
  password: string
  role: RegisterRole
}

export type AuthResult =
  | { success: true; user: User }
  | { success: false; error: string }

