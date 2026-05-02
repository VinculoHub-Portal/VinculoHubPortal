import { MOCK_USER_INTEREST_LABELS } from "./mockData"

interface SuggestedProjectsBannerProps {
  projectCount: number
}

export function SuggestedProjectsBanner({ projectCount }: SuggestedProjectsBannerProps) {
  return (
    // TODO(backend): a lista de interesses "(Educação, Meio Ambiente, Saúde)" vem de
    //   MOCK_USER_INTEREST_LABELS (hardcoded). Não existe endpoint para retornar os
    //   interesses/temas cadastrados pela empresa logada.
    <div className="bg-blue-50 border-l-4 border-vinculo-dark rounded-lg p-4 sm:p-6">
      <h3 className="text-base font-semibold text-vinculo-dark mb-1">💡 Projetos Sugeridos</h3>
      <p className="text-sm text-slate-700 leading-6">
        Com base nos seus interesses cadastrados ({MOCK_USER_INTEREST_LABELS}), encontramos{" "}
        {projectCount} {projectCount === 1 ? "projeto" : "projetos"} que{" "}
        {projectCount === 1 ? "pode" : "podem"} ser do seu interesse. Use os filtros acima para
        refinar sua busca.
      </p>
    </div>
  )
}
