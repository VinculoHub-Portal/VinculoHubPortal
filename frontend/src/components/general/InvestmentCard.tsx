import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import { useNavigate } from "react-router-dom"

export function InvestmentCard() {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-vinculo-green text-white grid place-items-center">
          <AttachMoneyOutlinedIcon className="text-white" style={{ fontSize: 37 }} />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-vinculo-dark">Investimento Social Privado</h3>
          <p className="text-slate-600 mt-2 max-w-xl">
            Invista diretamente em projetos sociais alinhados com os valores da sua empresa.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/empresa/investimento-social-privado")}
        className="mt-2 w-full rounded-2xl bg-vinculo-green px-6 py-4 text-white text-lg hover:bg-emerald-600 transition-colors"
      >
        Explorar oportunidades
      </button>
    </div>
  )
}
