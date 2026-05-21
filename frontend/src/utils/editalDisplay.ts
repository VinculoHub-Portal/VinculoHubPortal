/** Formata data ISO ou yyyy-mm-dd para exibição pt-BR (apenas data). */
export function formatEditalDatePtBr(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(d)
  } catch {
    return null
  }
}
