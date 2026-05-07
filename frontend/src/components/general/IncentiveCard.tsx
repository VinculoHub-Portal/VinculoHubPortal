import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import { useNavigate } from "react-router-dom"

export function IncentiveCard() {
  const navigate = useNavigate()

  return (
    <section>
      <div className="bg-white rounded-[10px] shadow-md p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-vinculo-dark text-white grid place-items-center">
            <DescriptionOutlinedIcon className="text-white" style={{ fontSize: 37 }} />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-vinculo-dark">Leis de Incentivo</h3>
            <p className="text-slate-600 mt-2 max-w-xl">
              Apoie projetos através de leis de incentivo fiscal e obtenha benefícios tributários.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/empresa/leis-de-incentivo")}
          className="mt-2 w-full rounded-2xl bg-vinculo-dark px-6 py-4 text-white text-lg hover:bg-slate-800 transition-colors"
        >
          Ver projetos disponíveis
        </button>
      </div>
    </section>
  )
}
