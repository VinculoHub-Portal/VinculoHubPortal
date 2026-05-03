import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/** Use em `<Link to={projectDetailsHref(id)} />` ou botões da listagem. Rota: `/projeto/:projectId`. */
export function projectDetailsHref(projectId: string | number) {
  return `/projeto/${encodeURIComponent(String(projectId))}`;
}

/**
 * Para cards de projeto: `onDetails={openProjectDetails}`.
 * Mantém a navegação centralizada aqui para quando o dashboard/listagem for integrado por outros devs.
 */
export function useProjectDetailsNavigation() {
  const navigate = useNavigate();
  return useCallback(
    (projectId: string | number) => {
      navigate(projectDetailsHref(projectId));
    },
    [navigate],
  );
}
