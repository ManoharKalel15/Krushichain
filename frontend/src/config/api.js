// src/config/api.js
import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '')
    return clean.endsWith('/api') ? clean : `${clean}/api`
  }
  return '/api'
}

const api = axios.create({ baseURL: getBaseURL(), timeout: 15000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kc_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kc_token')
      localStorage.removeItem('kc_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
