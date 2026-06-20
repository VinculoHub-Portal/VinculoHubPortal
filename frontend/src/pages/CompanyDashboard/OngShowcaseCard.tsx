import { useEffect, useState } from "react"
import CorporateFareIcon from "@mui/icons-material/CorporateFare"
import SearchIcon from "@mui/icons-material/Search"
import { Pagination } from "../../components/general/Pagination"
import { usePaginatedNpos } from "../../hooks/usePaginatedNpos"
import { OngRow } from "./OngRow"

export function OngShowcaseCard() {
  const [nameFilter, setNameFilter] = useState("")
  const [debouncedName, setDebouncedName] = useState("")

  const { npos, loading, error, currentPage, totalPages, totalElements, setCurrentPage, refetch } =
    usePaginatedNpos({ pageSize: 10, name: debouncedName })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(nameFilter)
      setCurrentPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [nameFilter, setCurrentPage])

  const isFiltering = nameFilter !== debouncedName

  const filteredNpos = debouncedName
    ? npos.filter((npo) => {
        const term = debouncedName.toLowerCase()
        return (
          npo.name.toLowerCase().includes(term) ||
          (npo.description?.toLowerCase().includes(term) ?? false)
        )
      })
    : npos

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-vinculo-dark">ONGs Cadastradas</h2>
          {!loading && !error && (
            <p className="mt-0.5 text-sm text-slate-500">
              {totalElements} {totalElements === 1 ? "ONG encontrada" : "ONGs encontradas"}
            </p>
          )}
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <SearchIcon fontSize="small" />
          </span>
          <input
            type="search"
            placeholder="Buscar ONG..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="min-w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
          />
        </div>
      </div>

      <div className="mt-7 hidden grid-cols-[minmax(240px,2fr)_minmax(160px,1fr)_56px] border-b border-slate-200 pb-4 text-sm font-semibold text-slate-500 lg:grid">
        <span>ONG</span>
        <span>Localização</span>
        <span className="text-center">Ações</span>
      </div>

      <div className={`transition-opacity duration-200 ${isFiltering ? "opacity-40" : "opacity-100"}`}>
        {loading && (
          <div className="flex h-80 flex-col items-center justify-center gap-3 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-vinculo-dark" />
            <p className="text-sm">Carregando ONGs...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex h-80 flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-vinculo-dark transition hover:bg-slate-50"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && filteredNpos.length === 0 && (
          <div className="flex h-80 flex-col items-center justify-center gap-2 text-slate-400">
            <CorporateFareIcon sx={{ fontSize: 48, color: "#cbd5e1" }} aria-hidden />
            <p className="text-sm">
              {debouncedName ? "Nenhuma ONG encontrada para esta busca." : "Nenhuma ONG cadastrada ainda."}
            </p>
          </div>
        )}

        {!loading && !error && filteredNpos.length > 0 && (
          <div className="mt-4 divide-y divide-slate-100">
            {filteredNpos.map((npo) => (
              <OngRow key={npo.id} npo={npo} />
            ))}
          </div>
        )}
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="mt-4 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        </div>
      )}
    </article>
  )
}
