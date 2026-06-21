import { useState, type ReactNode } from "react";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { ResponsibleInstitution } from "./projectDetails.types";

type Props = {
  institution: ResponsibleInstitution | null;
  headerAction?: ReactNode;
};

function buildLocation(city: string | null, stateCode: string | null): string | null {
  if (city && stateCode) return `${city}, ${stateCode}`;
  if (city) return city;
  if (stateCode) return stateCode;
  return null;
}

export function ResponsibleInstitutionCard({ institution, headerAction }: Props) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (!institution) return null;

  const { name, logoUrl, city, stateCode, description } = institution;
  const showLogo = logoUrl && !logoFailed;
  const location = buildLocation(city, stateCode);
  const hasHeaderAction = headerAction != null;

  return (
    <article className="bg-white rounded-2xl shadow-[var(--shadow-vinculo)] px-5 sm:px-8 py-6 sm:py-8 border border-slate-200">
      {/* Desktop: título + ações na mesma linha */}
      <div className="hidden sm:flex items-start justify-between gap-4 mb-4">
        <h2 className="text-base font-bold text-vinculo-dark">Organização Responsável</h2>
        {hasHeaderAction && <div className="shrink-0 pt-0.5">{headerAction}</div>}
      </div>

      {/* Mobile: título sozinho */}
      <h2 className="sm:hidden text-sm font-bold text-vinculo-dark mb-3">Organização Responsável</h2>

      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex items-center justify-center bg-vinculo-dark">
          {showLogo ? (
            <img
              src={logoUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <ApartmentIcon sx={{ fontSize: 24 }} className="text-white" aria-hidden />
          )}
        </div>

        <div className="min-w-0">
          <p className="font-bold text-vinculo-dark text-sm sm:text-base leading-snug">{name}</p>

          {description && (
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">{description}</p>
          )}

          {location && (
            <p className="flex items-center gap-1 text-slate-500 text-sm mt-1.5">
              <LocationOnIcon sx={{ fontSize: 15 }} aria-hidden />
              {location}
            </p>
          )}
        </div>
      </div>

      {/* Mobile: ações abaixo das informações da ONG */}
      {hasHeaderAction && (
        <div className="sm:hidden mt-4 pt-4 border-t border-slate-100">{headerAction}</div>
      )}
    </article>
  );
}
