import { useEffect, useState } from "react"
import { mockOngProjects, type OngProject } from "./mockData"

interface UseOngProjectsResult {
  projects: OngProject[]
  loading: boolean
  error: string | null
}

export function useOngProjects(): UseOngProjectsResult {
  const [projects, setProjects] = useState<OngProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProjects() {
      try {
        setLoading(true)
        setError(null)
        await new Promise((resolve) => window.setTimeout(resolve, 120))

        if (active) {
          setProjects(mockOngProjects)
        }
      } catch {
        if (active) {
          setError("Não foi possível carregar os projetos.")
          setProjects([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadProjects()

    return () => {
      active = false
    }
  }, [])

  return { projects, loading, error }
}
