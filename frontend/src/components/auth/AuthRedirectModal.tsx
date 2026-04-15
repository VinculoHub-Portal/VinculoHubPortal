import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { BaseButton } from "../general/BaseButton";

type AuthRedirectModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AuthRedirectModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onCancel,
}: AuthRedirectModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-vinculo-dark">
          <OpenInNewIcon />
        </div>

        <h2 className="mt-4 text-xl font-bold text-vinculo-dark">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <BaseButton variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </BaseButton>
          <BaseButton variant="secondary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Redirecionando..." : confirmLabel}
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
