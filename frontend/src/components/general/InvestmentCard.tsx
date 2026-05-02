
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined"

export function InvestmentCard() {
return (
 <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-vinculo-green text-white grid place-items-center">
                <AttachMoneyOutlinedIcon className="text-white " style={{ fontSize: 37 }} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-vinculo-dark">
                  Investimento Social Privado
                </h3>
                <p className="text-slate-600 mt-2 max-w-xl">
                  Invista diretamente em projetos sociais alinhados com os valores da sua empresa.
                </p>
              </div>
            </div>


            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckOutlinedIcon className="text-vinculo-green mt-1" style={{ fontSize: 20 }} />
                  <span className="text-slate-700 text-lg">Educação Ambiental nas Escolas</span>
                </div>
                <span className="text-slate-500">R$ 50.000 - R$ 180.000</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckOutlinedIcon className="text-vinculo-green mt-1" style={{ fontSize: 20 }} />
                  <span className="text-slate-700 text-lg">Saúde Comunitária</span>
                </div>
                <span className="text-slate-500">R$ 75.000 - R$ 85.000</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckOutlinedIcon className="text-vinculo-green mt-1" style={{ fontSize: 20 }} />
                  <span className="text-slate-700 text-lg">Inclusão Digital</span>
                </div>
                <span className="text-slate-500">R$ 20.000 - R$ 80.000</span>
              </div>
            </div>

            <button className="mt-8 w-full rounded-2xl bg-vinculo-green px-6 py-4 text-white text-lg hover:bg-emerald-600 transition-colors">
              Explorar oportunidades
            </button>
          </div>
)

}