import axios from 'axios'

const isProduction = process.env.NODE_ENV === 'production'

const api = axios.create({
  baseURL: isProduction
    ? 'https://lashes-backend-2h3o.onrender.com/api'  
    : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
