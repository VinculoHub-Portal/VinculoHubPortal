import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css' 
import ComponentsPage from './pages/ComponentsPage/index' 
import { Auth0Provider } from '@auth0/auth0-react'

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <ComponentsPage />
    </Auth0Provider>
  </StrictMode>,
)
