import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from '../lib/axios'

const AuthContext = createContext()
const BASE_URL = "http://localhost:8080/api/auth"
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      console.log('Fetching user info...')
      const res = await axios.get(`${BASE_URL}/me`, { withCredentials: true })
      console.log('Raw user info response:', res.data)
      
      // Lấy thông tin chi tiết của user
      const userDetailRes = await axios.get(`http://localhost:8080/api/users/by-id/${res.data.id}`, {
        withCredentials: true
      })
      console.log('User detail response:', userDetailRes.data)
      
      // Kết hợp thông tin từ cả hai API
      const userData = {
        ...res.data,
        ...userDetailRes.data
      }
      
      console.log('Processed user data:', userData)
      setUser(userData)
      setIsAdmin(userData.role === 'admin')
    } catch (err) {
      console.error('Error fetching user:', err.response?.data || err.message)
      setUser(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId) => {
    try {
      const userDetailRes = await axios.get(`http://localhost:8080/api/users/by-id/${userId}`, {
        withCredentials: true
      })
      console.log('Updated user data:', userDetailRes.data)
      setUser(userDetailRes.data)
      setIsAdmin(userDetailRes.data.role === 'admin')
    } catch (err) {
      console.error('Error updating user:', err.response?.data || err.message)
    }
  }

  const login = async (credentials) => {
    try {
      console.log('Logging in with credentials:', credentials)
      const response = await axios.post(`${BASE_URL}/login`, credentials, { withCredentials: true })
      console.log('Login successful, fetching user...')
      await checkUser()
      return response.data
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message)
      throw err
    }
  }

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true })
      setUser(null)
      setIsAdmin(false)
    } catch (err) {
      console.error('Error during logout:', err.response?.data || err.message)
    }
  }

  const updateAuthState = (userData) => {
    setUser(userData)
    setIsAdmin(userData.role === 'admin')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    updateUser,
    updateAuthState
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}