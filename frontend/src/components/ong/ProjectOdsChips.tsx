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
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(option.id)}
            className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
              selected
                ? "border-vinculo-green bg-vinculo-green text-white shadow-sm"
                : "border-slate-300 bg-white text-slate-600 hover:border-vinculo-green hover:text-vinculo-dark"
            }`}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
