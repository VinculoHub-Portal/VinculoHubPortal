import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

type ProjectHeaderProps = {
  fundingType: string;
  category: string;
  requiredAmountFormatted: string;
  name: string;
  city: string;
  stateUf: string;
};

export function ProjectHeader({
  fundingType,
  category,
  requiredAmountFormatted,
  name,
  city,
  stateUf,
}: ProjectHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="inline-flex items-center rounded-full bg-vinculo-green px-3 py-1 text-xs font-semibold text-white">
          {fundingType}
        </span>
        <span className="inline-flex items-center rounded-full bg-vinculo-dark px-3 py-1 text-xs font-semibold text-white">
          {category}
        </span>
        <span className="inline-flex items-center rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-vinculo-dark">
          {requiredAmountFormatted}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-vinculo-dark leading-tight">{name}</h1>

      <p className="mt-3 flex items-center gap-1 text-slate-600 text-sm">
        <LocationOnOutlinedIcon sx={{ fontSize: 18 }} className="text-slate-500" aria-hidden />
        <span>
          {city}, {stateUf}
        </span>
      </p>
    </>
  );
}
