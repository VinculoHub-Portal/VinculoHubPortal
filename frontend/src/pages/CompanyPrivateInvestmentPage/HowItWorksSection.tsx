const STEPS = [
  {
    title: "1. Escolha projetos alinhados",
    description: "Selecione iniciativas compatíveis com os temas de interesse da empresa.",
  },
  {
    title: "2. Demonstre interesse",
    description: "Entre em contato com as organizações responsáveis pelo projeto.",
  },
  {
    title: "3. Invista diretamente",
    description: "Realize o investimento sem intermediários, garantindo que o valor chegue à causa.",
  },
  {
    title: "4. Acompanhe o impacto",
    description: "Receba relatórios sobre o andamento do projeto e o impacto gerado.",
  },
]

export function HowItWorksSection() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-8 flex flex-col gap-3 sm:gap-6">
      <h2 className="text-base sm:text-xl font-medium leading-snug text-vinculo-dark">
        <span className="sm:hidden">Como funciona?</span>
        <span className="hidden sm:inline">Como funciona o Investimento Social Privado?</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 sm:gap-y-6">
        {STEPS.map((step) => (
          <div key={step.title} className="flex flex-col gap-0.5">
            <h3 className="text-sm font-semibold text-vinculo-dark">{step.title}</h3>
            <p className="text-sm text-slate-500 leading-snug sm:leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
