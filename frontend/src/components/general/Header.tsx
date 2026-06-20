import { Link } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { BaseButton } from "./BaseButton"
import { AuthRedirectModal } from "../auth/AuthRedirectModal"
import LinkIcon from "@mui/icons-material/Link"
import LanguageIcon from "@mui/icons-material/Language"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { resolveDashboardPath } from "../../utils/dashboardPath"
import { useAuthProfile } from "../../hooks/useAuthProfile"

const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthRedirectModalOpen, setIsAuthRedirectModalOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()
  const { data: profile } = useAuthProfile()

  // A user is a platform user only when Auth0-authenticated AND has a DB record
  const isPlatformUser = isAuthenticated && profile?.userId != null

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const openLoginRedirectNotice = () => {
    setIsMenuOpen(false)
    setIsAuthRedirectModalOpen(true)
  }

  const handleLogin = async () => {
    try {
      setIsAuthRedirectModalOpen(false)
      await loginWithRedirect({
        appState: {
          returnTo: window.location.pathname,
        },
        authorizationParams: {
          redirect_uri: window.location.origin,
          audience: auth0Audience,
          ui_locales: 'pt-BR',
        },
      })
    } catch (error) {
      console.error("Erro ao iniciar login com Auth0:", error)
    }
  }

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }

  const handleAuthClick = isPlatformUser ? handleLogout : openLoginRedirectNotice
  const authButtonLabel = isPlatformUser ? "Sair" : "Entrar"
  const homePath = isPlatformUser ? resolveDashboardPath(user) : "/"

  return (
    <header className="bg-vinculo-dark w-full shadow-md relative z-50">
      <div className="px-6 md:px-8 py-4 flex justify-between items-center">
        <Link
          to={homePath}
          className="flex items-center gap-2 text-white text-xl font-bold hover:opacity-90 transition-opacity"
          aria-label="Ir para a página inicial"
        >
          <span className="text-sm">
            <LanguageIcon />
          </span>
          VinculoHub<span className="text-vinculo-green">Portal</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {isPlatformUser && (
            <Link
              to="/meus-vinculos"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <LinkIcon fontSize="small" />
              Vínculos
            </Link>
          )}
          {!isPlatformUser && (
            <Link to="/cadastro/instituicao">
              <BaseButton
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Cadastro
              </BaseButton>
            </Link>
          )}

          <BaseButton
            className="bg-white! text-vinculo-dark! hover:bg-gray-100"
            onClick={handleAuthClick}
          >
            {authButtonLabel}
          </BaseButton>
        </div>
        <button
          className="md:hidden text-white text-xl w-8 h-8 aspect-square shrink-0 flex items-center justify-center border border-white/20 rounded"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMenuOpen ? <CloseIcon fontSize="inherit" /> : <MenuIcon fontSize="inherit" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-vinculo-dark border-t border-white/10 px-6 py-5 flex flex-col gap-3 animate-in slide-in-from-top duration-300">
          {isPlatformUser && (
            <Link
              to="/meus-vinculos"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-base font-medium text-white transition hover:bg-white/10"
            >
              <LinkIcon fontSize="small" />
              Vínculos
            </Link>
          )}

          {!isPlatformUser && (
            <BaseButton
              variant="outline"
              fullWidth
              className="border-white text-white py-3"
              onClick={() => navigate("/cadastro")}
            >
              Cadastro
            </BaseButton>
          )}

          <BaseButton
            fullWidth
            className="bg-white! text-vinculo-dark! py-3"
            onClick={handleAuthClick}
          >
            {authButtonLabel}
          </BaseButton>
        </div>
      )}

      <AuthRedirectModal
        open={isAuthRedirectModalOpen}
        title="Você será redirecionado para o acesso seguro"
        description="O login será aberto em uma etapa segura de autenticação para você entrar e voltar ao VinculoHubPortal em seguida."
        confirmLabel="Continuar"
        onCancel={() => setIsAuthRedirectModalOpen(false)}
        onConfirm={() => void handleLogin()}
      />
    </header>
  )
}
