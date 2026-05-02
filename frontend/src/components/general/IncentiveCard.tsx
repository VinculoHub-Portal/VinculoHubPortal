import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"


export function IncentiveCard() {
return(
        <section> 
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

</section>


)


}