import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const nombre = localStorage.getItem('nombre')
    const email = localStorage.getItem('email')
    const rol = localStorage.getItem('rol')

    if (token && rol) {
      setUser({ token, nombre, email, rol })
    }
    setLoading(false)
  }, [])

  const login = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('nombre', data.nombre)
    localStorage.setItem('email', data.email)
    localStorage.setItem('rol', data.rol)
    setUser(data)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  const isAdmin = () => user?.rol === 'ADMIN_OPERATOR' || user?.rol === 'ADMIN_DEV'
  const isDev = () => user?.rol === 'ADMIN_DEV'
  const isClient = () => user?.rol === 'CLIENT'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isDev, isClient }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
