import { BaseButton } from "../../../components/general/BaseButton";
import imagemGestCap from "../../../assets/ImagemSubPage1.png";

export function Presentation() {
  return (
    <section className="min-h-[calc(100vh-72px)] bg-surface flex items-center px-8 md:px-16 py-12">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">

        <div className="flex-1 flex flex-col gap-8">
          <h1 className="text-5xl md:text-6xl font-bold text-vinculo-dark leading-tight">
            Conectando{" "}
            <span className="text-vinculo-green">trajetórias</span>{" "}
            que transformam
          </h1>

          <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
            Mais que cursos de capacitação, a Vínculo é uma plataforma de gestão
            que organiza o dia a dia de ONGs e ajuda empresas a gerenciar suas
            iniciativas de responsabilidade social.
          </p>

          <div>
            <BaseButton variant="secondary" className="rounded-full px-10 py-4 text-lg">
              Sobre Nós
            </BaseButton>
          </div>
        </div>

        <div className="flex-[1.4] flex justify-center">
          <img
            src={imagemGestCap}
            alt="Gestão e Capacitação - Conectando pessoas e organizações"
            className="w-full [filter:drop-shadow(0_20px_40px_rgba(0,0,0,0.25))]"
          />
        </div>

      </div>
    </section>
  );
}
