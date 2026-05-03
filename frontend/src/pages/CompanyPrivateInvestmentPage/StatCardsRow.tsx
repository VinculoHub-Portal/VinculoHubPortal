import { MOCK_INTEREST_MATCH_PERCENT } from "./mockData"

interface StatCardProps {
  label: string
  value: string
  valueClassName?: string
}

function StatCard({ label, value, valueClassName = "text-vinculo-dark" }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <p className="text-sm text-slate-500 mb-2">{label}</p>
      <p className={`text-4xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  )
}

interface StatCardsRowProps {
  projectCount: number
  loading: boolean
}

export function StatCardsRow({ projectCount, loading }: StatCardsRowProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard label="Projetos sugeridos" value={loading ? "—" : String(projectCount)} />
      {/* TODO(backend): "Temas disponíveis" hoje hardcoded em 7 (comprimento de INVESTMENT_THEMES).
          Não há endpoint que liste os temas disponíveis no sistema. */}
      <StatCard label="Temas disponíveis" value="7" />
      {/* TODO(backend): "Match com seus interesses" hoje hardcoded em MOCK_INTEREST_MATCH_PERCENT.
          Backend deveria calcular afinidade entre interesses cadastrados da empresa e projetos. */}
      <StatCard
        label="Match com seus interesses"
        value={`${MOCK_INTEREST_MATCH_PERCENT}%`}
        valueClassName="text-vinculo-green"
      />
    </section>
  )
}
