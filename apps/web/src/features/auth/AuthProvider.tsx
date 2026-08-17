'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authApi } from '@/features/auth/api/authApi'
import type { AuthSession, AuthUser } from '@/features/auth/model/types'
import { sessionStore } from '@/features/auth/session/sessionStore'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  replaceSession: (session: AuthSession) => void
  updateUser: (user: AuthUser) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const publicRoutes = new Set(['/', '/login', '/register', '/cadastro'])
const authRoutes = new Set(['/login', '/register', '/cadastro'])

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const savedSession = sessionStore.read()

    if (savedSession) {
      setToken(savedSession.token)
      setUser(savedSession.user)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return

    const isPublicRoute = publicRoutes.has(pathname)

    if (!token && !isPublicRoute) {
      router.replace('/login')
      return
    }

    if (token && authRoutes.has(pathname)) {
      router.replace('/inicio')
    }
  }, [token, isLoading, pathname, router])

  const applySession = (session: AuthSession) => {
    sessionStore.save(session)
    setToken(session.token)
    setUser(session.user)
    router.replace('/inicio')
  }

  const replaceSession = (session: AuthSession) => {
    sessionStore.save(session)
    setToken(session.token)
    setUser(session.user)
  }

  const login = async (email: string, password: string) => {
    const session = await authApi.login(email, password)
    applySession(session)
  }

  const register = async (email: string, name: string, password: string) => {
    const session = await authApi.register(email, name, password)
    applySession(session)
  }

  const updateUser = (nextUser: AuthUser) => {
    if (!token) return

    sessionStore.save({ token, user: nextUser })
    setUser(nextUser)
  }

  const logout = () => {
    sessionStore.clear()
    setToken(null)
    setUser(null)
    router.replace('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, replaceSession, updateUser, logout, isLoading }}>
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
