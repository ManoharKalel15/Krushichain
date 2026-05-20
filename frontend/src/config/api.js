// src/config/api.js
import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 15000 })

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
