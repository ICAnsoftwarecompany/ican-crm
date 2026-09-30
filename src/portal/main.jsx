import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import PortalApp from './PortalApp'

createRoot(document.getElementById('portal-root')).render(
  <StrictMode>
    <PortalApp />
  </StrictMode>
)
