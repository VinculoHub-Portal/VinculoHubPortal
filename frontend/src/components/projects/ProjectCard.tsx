export type ProjectCardProps = {
  id: number | string;
  title: string;
  description?: string | null;
  fundingType?: "lei-incentivo" | "investimento-social-privado";
  targetAmount?: number | null;
  progressPercent?: number | null;
  generalProgress?: number | null;
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
  generalProgress,
  onDetails,
}: ProjectCardProps) {
  const isIncentiveLaw = fundingType === "lei-incentivo";
  const showBudget = isIncentiveLaw && targetAmount != null;
  const capturePercent = isIncentiveLaw
    ? Math.max(0, Math.min(100, Math.round(progressPercent ?? 0)))
    : null;
  const generalPercent = generalProgress != null
    ? Math.max(0, Math.min(100, Math.round(generalProgress)))
    : null;

  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full h-full flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-vinculo-green cursor-pointer"
      role="article"
      tabIndex={0}
      aria-label={`Projeto ${title}`}
      onClick={() => onDetails?.(id)}
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

      {generalPercent != null && (
        <>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Progresso</span>
            <span className="text-sm text-vinculo-green font-medium">{generalPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-vinculo-green h-2"
              style={{ width: `${generalPercent}%`, transition: "width 400ms ease" }}
              aria-valuenow={generalPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
              aria-label="Progresso do projeto"
            />
          </div>
          <span className="sr-only">{`Progresso ${generalPercent} por cento`}</span>
        </>
      )}

      {capturePercent != null && (
        <>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Progresso de captação</span>
            <span className="text-sm text-vinculo-green font-medium">{capturePercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-vinculo-green h-2"
              style={{ width: `${capturePercent}%`, transition: "width 400ms ease" }}
              aria-valuenow={capturePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
              aria-label="Progresso de captação do projeto"
            />
          </div>
          <span className="sr-only">{`Progresso de captação ${capturePercent} por cento`}</span>
        </>
      )}

      <div className="mt-auto pt-4 text-sm hidden sm:block">
        <button
          onClick={(e) => { e.stopPropagation(); onDetails?.(id); }}
          aria-label={`Ver detalhes do projeto ${title}`}
          className="cursor-pointer text-vinculo-dark font-medium hover:opacity-80 transition-opacity"
        >
          Ver detalhes →
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
