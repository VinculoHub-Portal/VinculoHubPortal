import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface BackLinkProps {
  label: string;
  onClick: () => void;
}

export function BackLink({ label, onClick }: BackLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-vinculo-dark transition-colors hover:bg-slate-200 hover:text-vinculo-dark-hover cursor-pointer"
    >
      <ArrowBackIcon fontSize="small" />
      <span>{label}</span>
    </button>
  );
}
