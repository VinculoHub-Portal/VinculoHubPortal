import { useAuth0 } from "@auth0/auth0-react";
import type { Dispatch, SetStateAction } from "react";
import type {
  OrganizationType,
  FieldErrors,
  WizardFormData,
} from "../../types/wizard.types";

type WizardSignUpProps = {
  organizationType: OrganizationType | null;
  onSelectOrganizationType: (type: OrganizationType) => void;
  formData: WizardFormData;
  setFormData: Dispatch<SetStateAction<WizardFormData>>;
  errors: FieldErrors;
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
        "w-full rounded-xl border mt-3 px-4 py-3.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vinculo-green",
        selected
          ? "border-vinculo-green bg-vinculo-green/5 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full border-2",
            selected ? "border-vinculo-green" : "border-slate-300",
          ].join(" ")}
        >
          {selected && (
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-vinculo-green" />
          )}
        </div>

        <span className={[
          "text-base sm:text-lg font-medium",
          selected ? "text-vinculo-dark" : "text-slate-700",
        ].join(" ")}>
          {title}
        </span>
      </div>
    </button>
  );
}

export function WizardSignUp({
  organizationType,
  onSelectOrganizationType,
  errors,
}: WizardSignUpProps) {
  const { loginWithRedirect } = useAuth0();

  return (
    <div>
      <div className="pt-1 pb-4">
        <h2 className="text-2xl sm:text-[26px] font-bold text-vinculo-dark leading-tight">
          Cadastro
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Escolha o tipo de conta que deseja criar.
        </p>
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

        {errors.organizationType && (
          <p className="mt-3 text-sm text-red-500">{errors.organizationType}</p>
        )}
      </div>

      <div className="pt-4 pb-1">
        <p className="text-sm text-slate-500">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={() => void loginWithRedirect({ authorizationParams: { ui_locales: "pt-BR" } })}
            className="text-blue-600 hover:underline font-medium cursor-pointer"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
