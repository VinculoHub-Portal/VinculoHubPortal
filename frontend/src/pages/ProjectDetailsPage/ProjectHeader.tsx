type ProjectHeaderProps = {
  fundingType: string;
  requiredAmountFormatted?: string | null;
  name: string;
};

export function ProjectHeader({ fundingType, requiredAmountFormatted, name }: ProjectHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="inline-flex items-center rounded-full bg-vinculo-green px-3 py-1 text-xs font-semibold text-white">
          {fundingType}
        </span>
        {requiredAmountFormatted && (
          <span className="inline-flex items-center rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-vinculo-dark">
            {requiredAmountFormatted}
          </span>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-vinculo-dark leading-tight">{name}</h1>
    </>
  );
}
