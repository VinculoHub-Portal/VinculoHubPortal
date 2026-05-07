type OdsTagsProps = {
  labels: string[];
};

export function OdsTags({ labels }: OdsTagsProps) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-bold text-vinculo-dark mb-4">
        Objetivos de Desenvolvimento Sustentável (ODS)
      </h2>
      {labels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {labels.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className="inline-flex rounded-lg bg-vinculo-dark px-3 py-1.5 text-xs sm:text-sm font-medium text-white"
            >
              {label}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Nenhum ODS vinculado a este projeto.</p>
      )}
    </section>
  );
}
