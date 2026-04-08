import { useNavigate } from "react-router-dom";

interface BackLinkProps {
  label: string;
}

export function BackLink({ label }: BackLinkProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-1 text-vinculo-dark hover:text-vinculo-dark-hover text-sm transition-colors w-fit font-medium cursor-pointer"
    >
      🡐 {label}
    </button>
  );
}
