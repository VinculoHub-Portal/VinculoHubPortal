import { BaseButton } from "../general/BaseButton";
import type { OrganizationType } from "../../types/wizard.types";

type NpoWizardFooterProps = {
  currentStep: number;
  totalSteps: number;
  organizationType: OrganizationType | null;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onFinalizeNpo: () => void;
};

export function NpoWizardFooter({
  currentStep,
  totalSteps,
  organizationType,
  isSubmitting,
  onBack,
  onNext,
  onFinalizeNpo,
}: NpoWizardFooterProps) {
  const isLast = currentStep === totalSteps;
  const showNpoFinalize = organizationType === "npo" && isLast;

  return (
    <div className="flex justify-center gap-4 mt-8">
      <BaseButton
        variant="ghost"
        className="w-32"
        onClick={onBack}
        disabled={currentStep === 1 || isSubmitting}
      >
        Voltar
      </BaseButton>

      {showNpoFinalize ? (
        <BaseButton
          variant="secondary"
          className="min-w-40"
          onClick={onFinalizeNpo}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando…" : "Concluir cadastro"}
        </BaseButton>
      ) : (
        <BaseButton
          variant="secondary"
          className="w-32"
          onClick={onNext}
          disabled={currentStep === totalSteps || isSubmitting}
        >
          Próximo
        </BaseButton>
      )}
    </div>
  );
}
