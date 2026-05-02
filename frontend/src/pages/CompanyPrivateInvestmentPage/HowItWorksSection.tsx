const STEPS = [
  {
    title: "1. Escolha projetos alinhados",
    description:
      "Selecione projetos que estejam alinhados com os valores e objetivos estratégicos da sua empresa através dos temas de interesse.",
  },
  {
    title: "2. Demonstre interesse",
    description:
      "Entre em contato direto com as organizações e inicie o diálogo para entender melhor o projeto e as necessidades.",
  },
  {
    title: "3. Invista diretamente",
    description:
      "Realize o investimento direto no projeto, sem intermediários, garantindo que 100% do valor chegue à causa.",
  },
  {
    title: "4. Acompanhe o impacto",
    description:
      "Receba relatórios periódicos sobre o andamento do projeto e o impacto gerado pelo seu investimento.",
  },
]

export function HowItWorksSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-medium leading-9 text-vinculo-dark">
        Como funciona o Investimento Social Privado?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {STEPS.map((step) => (
          <div key={step.title} className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-vinculo-dark">{step.title}</h3>
            <p className="text-sm text-slate-600 leading-6">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
