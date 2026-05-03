
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppRouter } from './router'
import { ToastProvider } from './context/ToastContext'

const queryClient = new QueryClient()

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
        ui_locales: 'pt-BR',
      }}
      onRedirectCallback={(appState) => {
        sessionStorage.setItem("auth0-login-completed", "true")
        if (appState?.returnTo && appState.returnTo !== "/") {
          sessionStorage.setItem("auth0-return-to", appState.returnTo)
        }
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || window.location.pathname,
        )
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </QueryClientProvider>
    </Auth0Provider>
  </StrictMode>,
);