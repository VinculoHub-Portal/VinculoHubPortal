interface WizardStepsProps {
  currentStep: number;
  totalSteps?: number;
}

function CheckIcon() {
  return (
    <svg
      className="w-3 h-3 sm:w-3.5 sm:h-3.5"
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
    <div className="flex items-center w-full py-4 sm:py-5">
      {steps.map((step, index) => {
        const completed = step < currentStep;
        const active = step === currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div
              className={[
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors duration-300 shrink-0",
                step <= currentStep
                  ? "bg-vinculo-green text-white"
                  : "bg-slate-200 text-slate-400",
              ].join(" ")}
              aria-current={active ? "step" : undefined}
            >
              {completed ? <CheckIcon /> : step}
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-1.5 sm:mx-2 bg-slate-200 overflow-hidden min-w-[6px]">
                <div
                  className="h-full bg-vinculo-green transition-all duration-500 ease-in-out"
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
