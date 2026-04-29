export type ProjectCardProps = {
  id: number | string;
  title: string;
  description: string;
  type: string; // modalidade (Lei Rouanet, Investimento Social, etc)
  fundingType?: "lei-incentivo" | "investimento-social-privado";
  targetAmount: number; // em centavos ou reais, front will format
  progressPercent: number; // 0-100
  location?: string;
  onDetails?: (id: number | string) => void;
};

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `R$ ${value}`;
  }
}

export function ProjectCard({
  id,
  title,
  description,
  type,
  fundingType = "lei-incentivo",
  targetAmount,
  progressPercent,
  location,
  onDetails,
}: ProjectCardProps) {
  const percent = Math.max(0, Math.min(100, Math.round(progressPercent)));
  const typeBadgeClassName =
    fundingType === "investimento-social-privado"
      ? "bg-vinculo-dark text-white"
      : "bg-vinculo-green text-white";

  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full h-full flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-vinculo-green"
      role="article"
      tabIndex={0}
      aria-label={`Projeto ${title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onDetails?.(id);
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 items-center">
          <span className={`${typeBadgeClassName} px-3 py-1 rounded-full text-sm font-semibold`}>{type}</span>
          <span className="bg-amber-300 text-neutral-900 px-3 py-1 rounded-full text-sm font-semibold">{formatCurrency(targetAmount)}</span>
        </div>
      </div>

      <h3 className="text-black text-lg font-bold mb-3 line-clamp-2" title={title}>{title}</h3>
      <p className="text-slate-600 text-sm mb-4 line-clamp-3">{description}</p>

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-600">Progresso da captação</span>
        <span className="text-sm text-vinculo-green font-medium">{percent}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden" aria-hidden="false">
        <div
          className="bg-vinculo-green h-2"
          style={{ width: `${percent}%`, transition: "width 400ms ease" }}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      <span className="sr-only">{`Progresso ${percent} por cento`}</span>

      <div className="flex items-center justify-between gap-2 mt-auto pt-4 text-sm text-slate-600">
        <button
          onClick={() => onDetails?.(id)}
          aria-label={`Ver detalhes do projeto ${title}`}
          className="text-vinculo-dark font-medium hover:opacity-80 transition-opacity"
        >
          Ver detalhes →
        </button>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>
          {location}
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
