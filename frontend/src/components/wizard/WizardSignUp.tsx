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
          {selected && (
            <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
          )}
        </div>

        <div>
          <h3 className="text-vinculo-dark text-xl">{title}</h3>
        </div>
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

        {errors.organizationType && (
          <p className="flex items-center w-full justify-center mx-auto max-w-xl mt-4 text-sm text-red-500">
            {errors.organizationType}
          </p>
        )}
      </div>

      <div className="flex items-center w-full justify-center py-8 mx-auto max-w-xl">
        <button
          type="button"
          onClick={() => void loginWithRedirect({ authorizationParams: { ui_locales: "pt-BR" } })}
          className="text-vinculo-dark text-sm hover:underline"
        >
          Já tenho login
        </button>
      </div>
    </div>
  );
}
