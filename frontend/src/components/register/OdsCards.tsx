import type { OdsCatalogItem } from "../../api/ods";

type OdsCardsProps = {
  options: OdsCatalogItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  error?: string;
  legend: string;
  description: string;
};

export function OdsCards({
  options,
  selectedIds,
  onToggle,
  error,
  legend,
  description,
}: OdsCardsProps) {
  return (
    <fieldset className="border-t border-slate-100 pt-5 border-x-0 border-b-0">
      <legend className="text-vinculo-dark font-semibold text-base mb-1">
        {legend}{" "}
        <span className="text-red-500" aria-hidden="true">
          *
        </span>
      </legend>
      <p className="text-sm text-slate-500 mb-4">{description}</p>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
        <div className="max-h-[22rem] overflow-y-auto overscroll-contain pr-2">
          <div className="grid grid-cols-1 gap-3">
            {options.map((option) => {
              const id = String(option.id);
              const selected = selectedIds.includes(id);

              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggle(id)}
                  className={`flex flex-col gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    selected
                      ? "border-vinculo-green bg-vinculo-green/10 text-vinculo-dark"
                      : "border-vinculo-gray bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="font-semibold text-sm">{option.name}</span>
                  <span className="text-xs text-slate-500">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-error mt-2" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
