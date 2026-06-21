import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import { useNavigate } from "react-router-dom"

export function IncentiveCard() {
  const navigate = useNavigate()

  return (
    <section>
      <div className="bg-white rounded-[10px] shadow-md p-5 sm:p-8">
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="aspect-square w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-vinculo-dark text-white grid place-items-center">
            <DescriptionOutlinedIcon className="text-white text-[28px] sm:text-[37px]" fontSize="inherit" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-vinculo-dark">Leis de Incentivo</h3>
            <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2 max-w-xl">
              Apoie projetos através de leis de incentivo fiscal e obtenha benefícios tributários.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/empresa/leis-de-incentivo")}
          className="mt-2 w-full cursor-pointer rounded-2xl bg-vinculo-dark px-6 py-3 sm:py-4 text-white text-base sm:text-lg hover:bg-slate-800 transition-colors"
        >
          Ver projetos disponíveis
        </button>
      </div>
    </section>
  )
}
