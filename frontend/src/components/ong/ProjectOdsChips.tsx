import type { OdsCatalogItem } from "../../api/ods";

type ProjectOdsChipsProps = {
  options: OdsCatalogItem[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};

export function ProjectOdsChips({
  options,
  selectedIds,
  onToggle,
}: ProjectOdsChipsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
      <div className="max-h-[22rem] overflow-y-auto overscroll-contain pr-2">
        <div className="grid grid-cols-1 gap-3">
          {options.map((option) => {
            const selected = selectedIds.includes(option.id);

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggle(option.id)}
                className={`flex flex-col gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  selected
                    ? "border-vinculo-green bg-vinculo-green/10 text-vinculo-dark"
                    : "border-vinculo-gray bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="text-sm font-semibold">{option.name}</span>
                <span className="text-xs text-slate-500">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
