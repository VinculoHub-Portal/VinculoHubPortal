// Filtro 100% client-side: o backend (ProjectListItemDTO) não retorna o tipo de lei
// específico (Rouanet, Esporte, etc). Quando o DTO ganhar esse campo, o `selected`
// poderá ser passado para `fetchProjects` em lugar de filtrar localmente.
import { INCENTIVE_LAWS, type IncentiveLawId } from "./mockData"

interface IncentiveLawFilterProps {
  selected: IncentiveLawId
  onChange: (id: IncentiveLawId) => void
}

export function IncentiveLawFilter({ selected, onChange }: IncentiveLawFilterProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col gap-4">
      <h2 className="text-base font-medium text-vinculo-dark">Filtrar por Lei de Incentivo</h2>

      <div className="flex flex-col gap-2">
        <label htmlFor="law-select" className="text-sm text-slate-600">
          Selecione a lei
        </label>
        <div className="relative">
          <select
            id="law-select"
            value={selected}
            onChange={(e) => onChange(e.target.value as IncentiveLawId)}
            className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-4 py-3 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-vinculo-dark cursor-pointer"
          >
            {INCENTIVE_LAWS.map((law) => (
              <option key={law.id} value={law.id}>
                {law.id === "todas" ? "Todas as lei" : law.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-slate-600">Filtros rápidos:</span>
        <div className="flex flex-wrap gap-2">
          {INCENTIVE_LAWS.map((law) => (
            <button
              key={law.id}
              onClick={() => onChange(law.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selected === law.id
                  ? "bg-vinculo-dark text-white"
                  : "bg-vinculo-light-gray text-slate-700 hover:bg-slate-200"
              }`}
            >
              {law.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
