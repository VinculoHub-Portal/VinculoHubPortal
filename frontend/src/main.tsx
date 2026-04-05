import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css' 
import ComponentsPage from './pages/ComponentsPage/index' 
import { Auth0Provider } from '@auth0/auth0-react'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-u4fix3yzonl4bp4i.us.auth0.com"
      clientId="8G4a34RjM1zx0QwJ1F5I4OVyEwywi6zU"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <ComponentsPage />
    </Auth0Provider>
  </StrictMode>,
)
