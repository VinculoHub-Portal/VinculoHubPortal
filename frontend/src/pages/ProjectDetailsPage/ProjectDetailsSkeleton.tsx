export function ProjectDetailsSkeleton() {
  return (
    <article
      className="bg-white rounded-2xl shadow-[var(--shadow-vinculo)] px-6 sm:px-10 py-8 sm:py-10 border border-slate-100 animate-pulse"
      aria-busy="true"
      aria-label="Carregando detalhes do projeto"
    >
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="h-7 w-28 rounded-full bg-slate-200" />
        <div className="h-7 w-24 rounded-full bg-slate-200" />
        <div className="h-7 w-32 rounded-full bg-slate-200" />
      </div>
      <div className="h-9 sm:h-10 max-w-xl rounded-lg bg-slate-200 mb-3" />
      <div className="h-5 w-48 rounded bg-slate-200" />

      <div className="mt-10 space-y-3">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 max-w-[88%] rounded bg-slate-100" />
      </div>

      <div className="mt-10 space-y-3">
        <div className="h-5 w-48 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 max-w-[92%] rounded bg-slate-100" />
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="h-5 w-36 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
        </div>
      </div>

      <div className="mt-10">
        <div className="h-5 w-64 rounded bg-slate-200 mb-4" />
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-40 rounded-lg bg-slate-200" />
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
        </div>
      </div>

      <div className="mt-10">
        <div className="h-5 w-48 rounded bg-slate-200 mb-4" />
        <div className="flex justify-between mb-3">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="h-4 w-24 rounded bg-slate-100" />
        </div>
        <div className="h-3 w-full rounded-full bg-slate-200" />
      </div>
    </article>
  );
}
