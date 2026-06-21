interface PaginationProps {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const isFirst = currentPage === 0
  const isLast = currentPage >= totalPages - 1

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-center gap-4 py-4"
    >
      <button
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Página anterior"
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-vinculo-dark transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Anterior
      </button>

      <span className="text-sm text-slate-600">
        Página {currentPage + 1} de {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Próxima página"
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-vinculo-dark transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próxima →
      </button>
    </nav>
  )
}
