import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import { useNavigate } from "react-router-dom"

export function InvestmentCard() {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-5 sm:p-8">
      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="aspect-square w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-vinculo-green text-white grid place-items-center">
          <AttachMoneyOutlinedIcon className="text-white text-[34px] sm:text-[44px]" fontSize="inherit" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold text-vinculo-dark">Investimento Social Privado</h3>
          <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2 max-w-xl">
            Invista diretamente em projetos sociais alinhados com os valores da sua empresa.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/empresa/investimento-social-privado")}
        className="mt-2 w-full cursor-pointer rounded-2xl bg-vinculo-green px-6 py-3 sm:py-4 text-white text-base sm:text-lg hover:bg-emerald-600 transition-colors"
      >
        Explorar oportunidades
      </button>
    </div>
  )
}
