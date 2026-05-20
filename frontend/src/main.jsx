import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

import { GoogleOAuthProvider } from '@react-oauth/google'

// Use a placeholder if ENV is missing so it doesn't crash, but it won't work cleanly without real Client ID
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '509750252217-431k1u4k778hcnro3t9j83o7le6jsnqs.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)
