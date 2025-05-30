import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()
const BASE_URL = "http://localhost:3000/api/auth"
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/me`, { withCredentials: true })
      setUser(res.data)
    //   console.log(user)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (credentials) => {
    await axios.post(`${BASE_URL}/login`, credentials, { withCredentials: true })
    await fetchUser()
  }

  const logout = async () => {
    await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true })
    setUser(null)
  }




  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}