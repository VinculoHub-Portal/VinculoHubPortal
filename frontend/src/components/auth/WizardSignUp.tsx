type OrganizationType = "npo" | "enterprise";

import { BaseButton } from "../general/BaseButton";

type WizardSingUpProps = {
  organizationType: OrganizationType;
  onSelectOrganizationType: (type: OrganizationType) => void;
  onNext: () => void;
};

type TypeCardProps = {
  title: string;
  selected: boolean;
  onClick: () => void;
};

function TypeCard({ title, selected, onClick }: TypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border mt-5 p-5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500",
        selected
          ? "border-green-500 shadow-md"
          : "border-vinculo-gray bg-white hover:border-vinculo-gray hover:shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            "mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
            selected ? "border-green-600" : "border-blue-200",
          ].join(" ")}
        >
          {selected && <div className="h-2.5 w-2.5 rounded-full bg-green-600" />}
        </div>

        <div>
          <h3 className="text-vinculo-dark text-xl">{title}</h3>
        </div>
      </div>
    </button>
  );
}

export function WizardSingUp({
  organizationType,
  onSelectOrganizationType,
  onNext,
}: WizardSingUpProps) {
  return (
    <div>
      <div className="flex items-center w-full justify-center py-4 mx-auto max-w-xl">
        <div className="text-vinculo-dark text-3xl -webkit-font-smoothing">
          Cadastro
        </div>
      </div>

      <div>
        <TypeCard
          title="Cadastro como ONG"
          selected={organizationType === "npo"}
          onClick={() => onSelectOrganizationType("npo")}
        />

        <TypeCard
          title="Cadastro como Empresa"
          selected={organizationType === "enterprise"}
          onClick={() => onSelectOrganizationType("enterprise")}
        />
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <BaseButton variant="ghost" className="w-32" disabled>
          Voltar
        </BaseButton>
        <BaseButton variant="secondary" className="w-32" onClick={onNext}>
          Próximo
        </BaseButton>
      </div>

      <div className="flex items-center w-full justify-center py-8 mx-auto max-w-xl">
        <a href="#" className="text-vinculo-dark text-x -webkit-font-smoothing hover:underline">
          Já tenho login
        </a>
      </div>
    </div>
  );
}