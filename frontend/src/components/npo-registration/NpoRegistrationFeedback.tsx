type NpoRegistrationFeedbackProps = {
  success: boolean;
  errorMessage: string | null;
  successMessage?: string;
  className?: string;
};

export function NpoRegistrationFeedback({
  success,
  errorMessage,
  successMessage = "Cadastro concluído com sucesso.",
  className = "",
}: NpoRegistrationFeedbackProps) {
  if (success) {
    return (
      <div
        role="status"
        className={`rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ${className}`}
      >
        {successMessage}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div
        role="alert"
        className={`rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 ${className}`}
      >
        {errorMessage}
      </div>
    );
  }

  return null;
}
