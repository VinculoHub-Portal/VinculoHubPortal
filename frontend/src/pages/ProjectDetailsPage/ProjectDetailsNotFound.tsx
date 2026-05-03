import { Link } from "react-router-dom";

type ProjectDetailsNotFoundProps = {
  dashboardPath: string;
};

export function ProjectDetailsNotFound({ dashboardPath }: ProjectDetailsNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-12 text-center shadow-[var(--shadow-vinculo)]">
        <h1 className="text-xl font-bold text-vinculo-dark mb-2">Projeto não encontrado</h1>
        <p className="text-slate-600 text-sm mb-8">
          O projeto que você procura não existe ou foi removido.
        </p>
        <Link
          to={dashboardPath}
          className="inline-flex w-full items-center justify-center rounded-lg bg-vinculo-dark px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Voltar para o Dashboard
        </Link>
      </div>
    </div>
  );
}
