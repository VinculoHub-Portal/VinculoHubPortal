export type ProjectCardProps = {
  id: number | string;
  title: string;
  description?: string | null;
  fundingType?: "lei-incentivo" | "investimento-social-privado";
  targetAmount?: number | null;
  progressPercent?: number | null;
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
  fundingType = "lei-incentivo",
  targetAmount,
  progressPercent,
  onDetails,
}: ProjectCardProps) {
  const isIncentiveLaw = fundingType === "lei-incentivo";
  const showBudget = isIncentiveLaw && targetAmount != null;
  const percent = isIncentiveLaw
    ? Math.max(0, Math.min(100, Math.round(progressPercent ?? 0)))
    : null;

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
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-black text-lg font-bold line-clamp-2" title={title}>{title}</h3>
        {showBudget && (
          <span className="shrink-0 bg-amber-300 text-neutral-900 px-3 py-1 rounded-full text-sm font-semibold">
            {formatCurrency(targetAmount!)}
          </span>
        )}
      </div>

      {description && (
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">{description}</p>
      )}

      {percent != null && (
        <>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Progresso da captação</span>
            <span className="text-sm text-vinculo-green font-medium">{percent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
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
        </>
      )}

      <div className="mt-auto pt-4 text-sm">
        <button
          onClick={() => onDetails?.(id)}
          aria-label={`Ver detalhes do projeto ${title}`}
          className="text-vinculo-dark font-medium hover:opacity-80 transition-opacity"
        >
          Ver detalhes →
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
