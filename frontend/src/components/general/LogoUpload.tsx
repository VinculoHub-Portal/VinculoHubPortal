import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

interface LogoUploadProps {
  label?: string;
  hint?: string;
  preview?: string | null;
  onChange: (file: File, previewUrl: string) => void;
  onRemove?: () => void;
  placeholder?: React.ReactNode;
  maxSizeMb?: number;
  accept?: string[];
}

export function LogoUpload({
  label = "Logo",
  hint,
  preview,
  onChange,
  onRemove,
  placeholder,
  maxSizeMb = 10,
  accept = ["image/png", "image/jpeg"],
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!accept.includes(file.type)) {
      setError("Formato inválido. Use PNG ou JPG.");
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${maxSizeMb} MB.`);
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => onChange(file, reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onRemove?.();
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const resolvedHint = hint ?? `PNG ou JPG, até ${maxSizeMb} MB`;

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <span className="text-slate-700 font-semibold text-sm">{label}</span>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50
            flex items-center justify-center overflow-hidden shrink-0
            hover:border-vinculo-green hover:bg-vinculo-green/5 transition-colors cursor-pointer"
        >
          {preview ? (
            <img src={preview} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400 text-3xl">
              {placeholder ?? "+"}
            </span>
          )}
        </button>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-semibold text-vinculo-green hover:underline cursor-pointer w-fit"
          >
            {preview ? "Trocar imagem" : "Enviar imagem"}
          </button>
          {preview && onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-400 hover:underline cursor-pointer w-fit"
            >
              Remover
            </button>
          )}
          <span className="text-xs text-slate-400">{resolvedHint}</span>
        </div>
      </div>

      {error && <span className="text-sm text-red-500">{error}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={accept.join(", ")}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
