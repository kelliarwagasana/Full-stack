import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getCurrentUser,
  login as loginUser,
  loginWithGoogle as loginGoogleUser,
  logout as logoutUser,
  register as registerUser,
  subscribeToAuthChange,
} from '../authStorage'
import type { AuthResult, LoginCredentials, RegisterCredentials, User } from '../types'

interface AuthContextValue {
  user: User | null
  login: (credentials: LoginCredentials) => AuthResult
  loginWithGoogle: () => AuthResult
  register: (credentials: RegisterCredentials) => AuthResult
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser())

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getCurrentUser())
    }

    const unsubscribe = subscribeToAuthChange(handleAuthChange)
    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (credentials: LoginCredentials) => {
        const result = loginUser(credentials)
        if (result.success) {
          setUser(result.user)
        }
        return result
      },
      loginWithGoogle: () => {
        const result = loginGoogleUser()
        if (result.success) {
          setUser(result.user)
        }
        return result
      },
      register: (credentials: RegisterCredentials) => {
        const result = registerUser(credentials)
        if (result.success) {
          setUser(result.user)
        }
        return result
      },
      logout: () => {
        logoutUser()
        setUser(null)
      },
      isAuthenticated: user !== null,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }

