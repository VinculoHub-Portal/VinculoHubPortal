import { BaseButton } from "../../components/general/BaseButton"
import { HeroIcon } from "../../assets/landingPage/HeroIcon"

export function Hero() {
  return (
    <section className="bg-slate-50 pt-10 pb-14 md:py-16 xl:py-24">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col items-center gap-10 px-4 sm:px-6 md:flex-row md:items-center md:gap-12 xl:gap-16 md:px-10">
        <div className="flex md:max-w-[560px] min-w-0 flex-col">
          <h1 className="text-[32px] sm:text-[38px] lg:text-5xl xl:text-6xl font-bold text-vinculo-dark leading-tight text-center md:text-left">
            Conectando
            <br className="hidden md:block" />{" "}
            <span className="text-vinculo-green">trajetórias</span> que
            transformam
          </h1>
          <p className="md:hidden text-sm text-slate-500 text-center mt-3">
            Conectando pessoas e organizações
          </p>
          <p className="text-base md:text-lg text-slate-600 max-w-lg leading-relaxed text-center md:text-left mt-5 md:mt-6">
            Mais que cursos de capacitação, a Vínculo é uma plataforma de gestão
            que organiza o dia a dia de ONGs e ajuda empresas a gerenciar suas
            iniciativas de responsabilidade social.
          </p>
          <div className="mt-6 md:mt-8">
            <BaseButton
              variant="secondary"
              fullWidth
              className="rounded-full! text-base md:w-fit md:px-20 md:py-4 cursor-pointer"
              onClick={() => {
                document.getElementById("sobre-nos")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }}
            >
              Sobre Nós
            </BaseButton>
          </div>
        </div>

        <div className="hidden md:flex md:flex-col md:max-w-[600px] md:flex-1 md:min-w-0 md:items-center md:justify-center md:gap-4 md:p-6 xl:p-8 w-full rounded-3xl bg-white shadow-xl relative">
          <div className="absolute -top-5 -right-3 bg-[#FDC700] text-[#00467F] font-bold text-base xl:text-lg px-5 py-2.5 xl:px-7 xl:py-3.5 rounded-[10px] rotate-6 shadow-lg">
            Gestão + Capacitação!
          </div>
          <div className="w-full aspect-586/400 rounded-2xl overflow-hidden">
            <HeroIcon />
          </div>
          <p className="text-lg xl:text-2xl text-[#4A5565] text-center">
            Conectando pessoas e organizações
          </p>
        </div>
      </div>
    </section>
  )
}
