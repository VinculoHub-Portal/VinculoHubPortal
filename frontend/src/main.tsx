import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.css";
import { Auth0Provider } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./router";

const queryClient = new QueryClient();

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

if (!auth0Domain || !auth0ClientId || !auth0Audience) {
  console.warn("Auth0 não configurado. Rodando sem autenticação.");
}

const auth0Enabled = !!(auth0Domain && auth0ClientId && auth0Audience);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {auth0Enabled ? (
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: auth0Audience,
          ui_locales: "pt-BR",
        }}
        onRedirectCallback={(appState) => {
          sessionStorage.setItem("auth0-login-completed", "true");
          window.history.replaceState(
            {},
            document.title,
            appState?.returnTo || window.location.pathname,
          );
        }}
      >
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
      </Auth0Provider>
    ) : (
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    )}
  </StrictMode>,
);
