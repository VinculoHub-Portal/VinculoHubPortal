import { useState } from "react";

type OdsTagsProps = {
  labels: string[];
};

const SHOW_ALL_THRESHOLD = 4;
const INITIAL_VISIBLE = 3;

export function OdsTags({ labels }: OdsTagsProps) {
  const [expanded, setExpanded] = useState(false);

  const needsCollapse = labels.length > SHOW_ALL_THRESHOLD;
  const visibleLabels = needsCollapse && !expanded ? labels.slice(0, INITIAL_VISIBLE) : labels;
  const hiddenCount = labels.length - INITIAL_VISIBLE;

  return (
    <section className="mt-6 sm:mt-8">
      <h2 className="text-sm sm:text-base font-bold text-vinculo-dark mb-2 sm:mb-3">
        Objetivos de Desenvolvimento Sustentável (ODS)
      </h2>

      {labels.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {visibleLabels.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className="inline-flex rounded-lg bg-vinculo-dark px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-white"
            >
              {label}
            </span>
          ))}

          {needsCollapse && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-expanded={false}
              className="inline-flex rounded-lg border border-vinculo-dark bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-vinculo-dark hover:bg-vinculo-dark/5 transition-colors cursor-pointer"
            >
              +{hiddenCount} ODS
            </button>
          )}

          {needsCollapse && expanded && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-expanded={true}
              className="inline-flex rounded-lg border border-slate-300 bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Ver menos
            </button>
          )}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Nenhum ODS vinculado a este projeto.</p>
      )}
    </section>
  );
}
