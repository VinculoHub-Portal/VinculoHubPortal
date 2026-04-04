interface WizardStepsProps {
  currentStep: number;
  totalSteps?: number;
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function WizardSteps({ currentStep, totalSteps = 5 }: WizardStepsProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center w-full max-w-xl mx-auto py-8">
      {steps.map((step, index) => {
        const completed = step < currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-md shrink-0
              ${
                step <= currentStep
                  ? "bg-vinculo-green text-white scale-110"
                  : "bg-slate-200 text-slate-500"
              }
            `}
            >
              {completed ? <CheckIcon /> : step}
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 bg-slate-200 overflow-hidden min-w-[8px]">
                <div
                  className="h-full bg-vinculo-green transition-all duration-700 ease-in-out"
                  style={{ width: step < currentStep ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
