interface ProjectSummaryCardProps {
  label: string;
  value: number;
}

export function ProjectSummaryCard({ label, value }: ProjectSummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <strong className="mt-3 block text-4xl font-bold text-vinculo-dark">
        {value}
      </strong>
    </article>
  );
}
