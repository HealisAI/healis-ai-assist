import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import HealisApp from './HealisApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HealisApp />
  </StrictMode>,
)
