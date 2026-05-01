import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined"

export function CompanyCards() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="max-w-none mx-auto px-6">
        <h2 className="text-3xl md:text-2xl font-medium text-vinculo-dark mb-8">
          Modalidades de Investimento
        </h2>

        <div className="grid gap-8 lg:grid-cols-2  ">
          <div className="bg-white rounded-[10px] shadow-md p-8 ">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-vinculo-dark text-white grid place-items-center">
                <DescriptionOutlinedIcon className="text-white" style={{ fontSize: 37  }} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-vinculo-dark">
                  Leis de Incentivo
                </h3>
                <p className="text-slate-600 mt-2 max-w-xl">
                  Apoie projetos através de leis de incentivo fiscal e obtenha benefícios tributários.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl font-semibold bg-slate-100 px-5 py-4 text-slate-700">
                Lei Rouanet (Federal)
              </div>
              <div className="rounded-2xl font-semibold bg-slate-100 px-5 py-4 text-slate-700">
                Lei do Audiovisual (Federal)
              </div>
              <div className="rounded-2xl font-semibold bg-slate-100 px-5 py-4 text-slate-700">
                Lei de Incentivo ao Esporte (Federal)
              </div>
              <div className="rounded-2xl font-semibold bg-slate-100 px-5 py-4 text-slate-700">
                Fundo do Idoso (Federal/Estadual/Municipal)
              </div>
              <div className="rounded-2xl font-semibold bg-slate-100 px-5 py-4 text-slate-700">
                Fundo de Criança e Adolescente (Federal/Estadual/Municipal)
              </div>
              <div className="rounded-2xl font-semibold bg-slate-100 px-5 py-4 text-slate-700">
                PRONON/PRONAS (Federal)
              </div>
            </div>

            <button className="mt-8 w-full rounded-2xl bg-vinculo-dark px-6 py-4 text-white text-lg  hover:bg-slate-800 transition-colors">
              Ver projetos disponíveis
            </button>
          </div>

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
        </div>
      </div>
    </section>
  )
}