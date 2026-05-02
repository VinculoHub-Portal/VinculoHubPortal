export type ProjectOdsOption =
  | "educacao-qualidade"
  | "saude-bem-estar"
  | "igualdade-genero"
  | "reducao-desigualdades"
  | "cidades-sustentaveis";

type OdsOption = {
  value: ProjectOdsOption;
  label: string;
};

type ProjectOdsChipsProps = {
  selectedValues: ProjectOdsOption[];
  onToggle: (value: ProjectOdsOption) => void;
};

const ODS_OPTIONS: OdsOption[] = [
  { value: "educacao-qualidade", label: "Educacao de Qualidade" },
  { value: "saude-bem-estar", label: "Saude e Bem-Estar" },
  { value: "igualdade-genero", label: "Igualdade de Genero" },
  { value: "reducao-desigualdades", label: "Reducao das Desigualdades" },
  { value: "cidades-sustentaveis", label: "Cidades Sustentaveis" },
];

export function ProjectOdsChips({
  selectedValues,
  onToggle,
}: ProjectOdsChipsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {ODS_OPTIONS.map((option) => {
        const selected = selectedValues.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(option.value)}
            className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
              selected
                ? "border-vinculo-green bg-vinculo-green text-white shadow-sm"
                : "border-slate-300 bg-white text-slate-600 hover:border-vinculo-green hover:text-vinculo-dark"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
