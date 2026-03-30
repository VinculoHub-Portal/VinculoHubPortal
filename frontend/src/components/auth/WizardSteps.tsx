interface WizardStepsProps {
  currentStep: number;
  totalSteps?: number;
}

export function WizardSteps({ currentStep, totalSteps = 5 }: WizardStepsProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center w-full max-w-xl mx-auto py-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          {/* O Círculo do Passo */}
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 shadow-md
              ${
                step <= currentStep
                  ? "bg-vinculo-green text-white scale-110"
                  : "bg-slate-200 text-slate-500"
              }
            `}
          >
            {step}
          </div>

          {/* A Linha Conectora */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-2 bg-slate-200 overflow-hidden">
              <div
                className={`h-full bg-vinculo-green transition-all duration-700 ease-in-out`}
                style={{ width: step < currentStep ? "100%" : "0%" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
