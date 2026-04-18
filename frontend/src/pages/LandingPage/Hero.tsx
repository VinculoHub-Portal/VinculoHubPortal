import { BaseButton } from "../../components/general/BaseButton"
import { HeroIcon } from "../../assets/LandingPage/HeroIcon"

export function Hero() {
  return (
    <section className="flex md:h-screen bg-surface pt-10 pb-20 md:pb-0">
      <div className="mx-auto flex w-full flex-1 flex-col items-center gap-16 px-4 md:flex-row md:items-center md:px-16 md:pb-16">
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="text-3xl md:text-7xl text-center md:text-left font-bold text-vinculo-dark leading-tight">
            Conectando
            <br className="hidden md:block" />{" "}
            <span className="text-vinculo-green">trajetórias</span> que
            transformam
          </h1>
          <p className="md:hidden text-sm text-slate-500 text-center mt-[14px]">
            Conectando pessoas e organizações
          </p>
          <p className="md:text-lg text-slate-600 max-w-lg leading-relaxed md:text-left text-center mt-8">
            Mais que cursos de capacitação, a Vínculo é uma plataforma de gestão
            que organiza o dia a dia de ONGs e ajuda empresas a gerenciar suas
            iniciativas de responsabilidade social.
          </p>
          <div className="mt-8">
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
        <div className="hidden md:flex md:flex-col md:flex-1 md:min-w-0 md:items-center md:justify-center md:gap-4 md:p-8 w-full rounded-3xl bg-white shadow-2xl relative">
          <div className="absolute -top-6 -right-4 bg-[#FDC700] text-[#00467F] font-bold text-lg px-7 py-3.5 rounded-[10px] rotate-6 shadow-lg">
            Gestão + Capacitação!
          </div>
          <div className="w-full aspect-586/400 rounded-2xl overflow-hidden">
            <HeroIcon />
          </div>
          <p className="text-2xl text-[#4A5565] text-center">
            Conectando pessoas e organizações
          </p>
        </div>
      </div>
    </section>
  )
}
