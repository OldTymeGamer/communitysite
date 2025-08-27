"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  username: string
  email?: string
  profilePicture?: string
  isAdmin: boolean
  isOwner: boolean
  isEmailVerified: boolean
}

interface AuthContextType {
  user: User | null
  login: (token: string, userData: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('auth-token')
    if (token) {
      // Verify token with server
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        } else {
          localStorage.removeItem('auth-token')
        }
      })
      .catch(() => {
        localStorage.removeItem('auth-token')
      })
      .finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem('auth-token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
