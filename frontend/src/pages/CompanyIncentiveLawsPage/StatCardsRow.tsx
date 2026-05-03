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
      <StatCard label="Projetos disponíveis" value={loading ? "—" : String(projectCount)} />
      {/* TODO(backend): "Leis disponíveis" hoje hardcoded em 6.
          Não há endpoint que liste tipos de lei de incentivo no sistema. */}
      <StatCard label="Leis disponíveis" value="6" />
      {/* TODO(backend): "Investimento médio" hoje hardcoded em "R$ 73k".
          Requer ProjectListItemDTO expor targetAmount/budgetNeeded para cálculo de média no frontend,
          OU endpoint de agregação dedicado. */}
      <StatCard
        label="Investimento médio"
        value="R$ 73k"
        valueClassName="text-vinculo-green"
      />
    </section>
  )
}
