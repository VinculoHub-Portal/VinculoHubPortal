import { useQuery } from "@tanstack/react-query";
import { buildProjectsSummary, mockProjects } from "../mocks/projects";

type ProjectsScenario = "success" | "empty" | "error";

type UseProjectsOptions = {
  scenario?: ProjectsScenario;
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function useProjects({ scenario = "success" }: UseProjectsOptions = {}) {
  const query = useQuery({
    queryKey: ["projects", scenario],
    queryFn: async () => {
      await sleep(250);

      if (scenario === "error") {
        throw new Error("Não foi possível carregar os projetos.");
      }

      return scenario === "empty" ? [] : mockProjects;
    },
    retry: false,
  });

  return {
    projects: query.data ?? [],
    summary: buildProjectsSummary(query.data ?? []),
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
