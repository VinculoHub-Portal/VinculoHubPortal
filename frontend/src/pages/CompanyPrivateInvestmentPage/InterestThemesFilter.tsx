import { INVESTMENT_THEMES, type ThemeId } from "./mockData"

interface InterestThemesFilterProps {
  selected: Set<ThemeId>
  onToggle: (id: ThemeId) => void
  counts: Record<ThemeId, number>
}

export function InterestThemesFilter({ selected, onToggle, counts }: InterestThemesFilterProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col gap-4">
      <h2 className="text-base font-medium text-vinculo-dark">Temas de Interesse</h2>
      <p className="text-sm text-slate-600">
        Selecione os temas que mais se alinham com os valores e objetivos da sua empresa. Os
        projetos serão filtrados automaticamente.
      </p>
      <div className="flex flex-wrap gap-2">
        {INVESTMENT_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onToggle(theme.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selected.has(theme.id)
                ? "bg-vinculo-dark text-white"
                : "bg-vinculo-light-gray text-slate-700 hover:bg-slate-200"
            }`}
          >
            {theme.label} ({counts[theme.id] ?? 0})
          </button>
        ))}
      </div>
    </div>
  )
}
