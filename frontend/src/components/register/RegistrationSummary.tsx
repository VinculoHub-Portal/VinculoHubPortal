import type { ReactNode } from "react";
import { BaseButton } from "../general/BaseButton";

export interface SummaryField {
  label: string;
  value: string;
  icon: ReactNode;
  required?: boolean;
}

export interface SummarySection {
  title: string;
  fields: SummaryField[];
}

interface RegistrationSummaryProps {
  entityName: string;
  entitySubtitle?: string;
  // entityIcon: ReactNode;
  sections: SummarySection[];
  completedSteps: number;
  totalSteps: number;
  onBack: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  errorMessage?: string;
}

function computeProgress(sections: SummarySection[]): {
  progress: number;
  profileCompletion: number;
} {
  const allFields = sections.flatMap((s) => s.fields);
  const requiredFields = allFields.filter((f) => f.required);
  const optionalFields = allFields.filter((f) => !f.required);

  const filledRequired = requiredFields.filter((f) => f.value.trim() !== "").length;
  const filledOptional = optionalFields.filter((f) => f.value.trim() !== "").length;

  const progress = requiredFields.length > 0
    ? Math.round((filledRequired / requiredFields.length) * 100)
    : 100;

  const total = allFields.length;
  const profileCompletion = total > 0
    ? Math.round(((filledRequired + filledOptional) / total) * 100)
    : 100;

  return { progress, profileCompletion };
}

function SectionCard({ title, fields }: { title: string; fields: SummaryField[] }) {
  return (
    <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((field) => (
          <div key={field.label} className="flex items-start gap-2">
            <span className="text-vinculo-green mt-0.5 shrink-0 text-[18px]">
              {field.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{field.label}</p>
              <p
                className={`text-sm font-medium truncate ${
                  field.value ? "text-vinculo-dark" : "text-slate-300 italic"
                }`}
              >
                {field.value || "Não informado"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RegistrationSummary({
  entityName,
  entitySubtitle,
  // entityIcon,
  sections,
  completedSteps,
  totalSteps,
  onBack,
  onSubmit,
  isLoading = false,
  errorMessage,
}: RegistrationSummaryProps) {
  const { progress, profileCompletion } = computeProgress(sections);
  const isReady = progress === 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho da entidade */}
      <div className="flex flex-col items-center gap-1 py-4 border-b border-slate-100">
        { /* <div className="w-16 h-16 rounded-full bg-vinculo-green/10 flex items-center justify-center mb-1">
          {entityIcon}
        </div> */ }
        <h2 className="text-xl font-bold text-vinculo-dark">
          {entityName || "—"}
        </h2>
        {entitySubtitle && (
          <span className="text-xs text-slate-400">{entitySubtitle}</span>
        )}
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center gap-1 border border-vinculo-green rounded-xl p-5">
          <span className="text-2xl font-bold text-vinculo-green">
            {profileCompletion}%
          </span>
          <span className="text-xs text-slate-500 text-center">
            Perfil Preenchido
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 border border-blue-300 rounded-xl p-5">
          <span className="text-2xl font-bold text-vinculo-dark">
            {completedSteps}/{totalSteps}
          </span>
          <span className="text-xs text-slate-500 text-center">
            Etapas Concluídas
          </span>
        </div>
      </div>

      {/* Seções de resumo */}
      {sections.map((section) => (
        <SectionCard key={section.title} title={section.title} fields={section.fields} />
      ))}

      {/* Aviso se incompleto */}
      {!isReady && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Preencha todos os campos obrigatórios antes de finalizar o cadastro.
        </p>
      )}

      {/* Erro de envio */}
      {errorMessage && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {errorMessage}
        </p>
      )}

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <BaseButton
          variant="ghost"
          className="w-28"
          onClick={onBack}
          disabled={isLoading}
        >
          Voltar
        </BaseButton>
        <BaseButton
          variant="secondary"
          className="w-44"
          onClick={onSubmit}
          disabled={!isReady || isLoading}
        >
          {isLoading ? "Enviando..." : "Finalizar Cadastro"}
        </BaseButton>
      </div>
    </div>
  );
}
