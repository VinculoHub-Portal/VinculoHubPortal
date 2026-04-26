interface ProjectProgressProps {
  value: number;
}

export function ProjectProgress({ value }: ProjectProgressProps) {
  const progress = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-500">Conclusão</span>
        <span className="text-sm font-semibold text-vinculo-green">{progress}%</span>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-vinculo-green transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
