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
    <article className="bg-white rounded-2xl shadow-[var(--shadow-vinculo)] px-6 sm:px-10 py-8 sm:py-10 border border-slate-100">
      <div className="flex items-start justify-between gap-4">
        <h2
          className={`text-base font-bold text-vinculo-dark ${hasHeaderAction ? "mb-0" : "mb-4"}`}
        >
          Organização Responsável
        </h2>

        {hasHeaderAction && <div className="shrink-0 pt-0.5">{headerAction}</div>}
      </div>

      <div className="mt-4 flex items-start gap-4">
        <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-vinculo-dark">
          {showLogo ? (
            <img
              src={logoUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <ApartmentIcon sx={{ fontSize: 28, color: "white" }} aria-hidden />
          )}
        </div>

        <div className="min-w-0">
          <p className="font-bold text-vinculo-dark leading-snug">{name}</p>

          {description && (
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">{description}</p>
          )}

          {location && (
            <p className="flex items-center gap-1 text-slate-500 text-sm mt-2">
              <LocationOnIcon sx={{ fontSize: 16 }} aria-hidden />
              {location}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
