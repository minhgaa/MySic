import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()
const BASE_URL = "http://localhost:3000/api/auth"
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/me`, { withCredentials: true })
      setUser(res.data)
      setIsAdmin(res.data.role === 'admin')
    } catch (err) {
      setUser(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (credentials) => {
    const response = await axios.post(`${BASE_URL}/login`, credentials, { withCredentials: true })
    await fetchUser()
    return response.data
  }

  const logout = async () => {
    await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true })
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}