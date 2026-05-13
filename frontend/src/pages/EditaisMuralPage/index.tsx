import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import { useAuth0 } from "@auth0/auth0-react"
import { Link } from "react-router-dom"
import { EditalCard } from "../../components/editais/EditalCard"
import { BaseButton } from "../../components/general/BaseButton"
import { Header } from "../../components/general/Header"
import { useEditais } from "../../hooks/useEditais"
import { formatEditalDatePtBr } from "../../utils/editalDisplay"
import { resolveDashboardPath } from "../../utils/dashboardPath"

const ROLES_CLAIM = "https://vinculohub/roles"

function useIsAdmin(): boolean {
  const { user } = useAuth0()
  const rawRoles = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM]
  const userRoles: string[] = Array.isArray(rawRoles) ? rawRoles : []
  return userRoles.some((r) => String(r).toUpperCase() === "ADMIN")
}

export function EditaisMuralPage() {
  const { user } = useAuth0()
  const { editais, loading, error } = useEditais()
  const isAdmin = useIsAdmin()
  const dashboardPath = resolveDashboardPath(user)

  return (
    <div className="min-h-screen bg-surface flex flex-col gap-10 pb-20">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6">
        <Link
          to={dashboardPath}
          className="flex w-fit items-center gap-1 text-sm font-medium text-vinculo-dark transition-opacity hover:opacity-70"
        >
          <ChevronLeftIcon fontSize="small" />
          Voltar ao Dashboard
        </Link>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-vinculo-dark sm:text-3xl">
              Cadastro e Publicação de Editais
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-6 text-slate-600">
              Gerencie o mural de oportunidades de financiamento para as ONGs
            </p>
          </div>
          {isAdmin ? (
            <BaseButton
              type="button"
              variant="secondary"
              className="shrink-0 shadow-sm"
            >
              + Novo Edital
            </BaseButton>
          ) : null}
        </header>

        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          aria-labelledby="editais-publicados-heading"
        >
          <h2
            id="editais-publicados-heading"
            className="mb-6 text-lg font-semibold text-vinculo-dark"
          >
            Editais Publicados ({loading ? "…" : editais.length})
          </h2>

          {loading ? (
            <p className="text-center text-sm font-medium text-slate-600" aria-live="polite">
              Carregando editais...
            </p>
          ) : null}

          {!loading && error ? (
            <div
              className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
              role="alert"
            >
              <ErrorOutlineIcon fontSize="small" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : null}

          {!loading && !error && editais.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Inventory2OutlinedIcon className="text-slate-400" fontSize="large" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                Nenhum edital publicado no momento.
              </p>
            </div>
          ) : null}

          {!loading && !error && editais.length > 0 ? (
            <ul className="flex flex-col gap-5">
              {editais.map((e) => {
                const prazo = formatEditalDatePtBr(e.deadline)
                const pub = formatEditalDatePtBr(e.publishedAt)
                return (
                  <li key={e.id}>
                    <EditalCard
                      title={e.title}
                      isActive={e.isActive}
                      description={e.description}
                      odsLabel={e.odsLabel}
                      deadlineLine={prazo ? `Prazo: ${prazo}` : null}
                      fileUrl={e.fileUrl}
                      fileName={e.fileName}
                      publishedLine={pub ? `Publicado em ${pub}` : null}
                    />
                  </li>
                )
              })}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  )
}
