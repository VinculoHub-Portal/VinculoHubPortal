import './styles/main.css' 
import ComponentsPage from './pages/ComponentsPage/index' 
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles/main.css"
import { Auth0Provider } from '@auth0/auth0-react'
import { AppRouter } from './router'

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE

if (!auth0Domain || !auth0ClientId || !auth0Audience) {
  console.error("Auth0 não configurado. Confira VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID e VITE_AUTH0_AUDIENCE.")
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Audience,
      }}
      onRedirectCallback={(appState) => {
        sessionStorage.setItem("auth0-login-completed", "true")
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || window.location.pathname,
        )
      }}
    >
      <ComponentsPage />
    </Auth0Provider>
  </StrictMode>,
)
