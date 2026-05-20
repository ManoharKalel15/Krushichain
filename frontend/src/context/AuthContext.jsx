import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kc_token')
    const saved = localStorage.getItem('kc_user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      api.get('/auth/me').then(r => {
        setUser(r.data.user)
        localStorage.setItem('kc_user', JSON.stringify(r.data.user))
      }).catch(() => logout())
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('kc_token', token)
    localStorage.setItem('kc_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('kc_token')
    localStorage.removeItem('kc_user')
    setUser(null)
  }

  const updateUser = (data) => {
    const merged = { ...user, ...data }
    localStorage.setItem('kc_user', JSON.stringify(merged))
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
