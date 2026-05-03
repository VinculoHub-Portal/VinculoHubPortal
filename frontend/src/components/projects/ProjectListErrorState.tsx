type ProjectListErrorStateProps = {
  onRetry: () => void;
};

export function ProjectListErrorState({ onRetry }: ProjectListErrorStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm" role="alert">
      <p className="text-slate-700 mb-4">Não foi possível carregar seus projetos no momento</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center rounded-lg bg-vinculo-dark px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        Tentar novamente
      </button>
    </div>
  );
}
