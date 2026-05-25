import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useState } from "react"
import {
  fetchCompanySupportedProjectsSummary,
  type CompanySupportedProjectsSummary,
} from "../../api/companyPortfolio"

interface UseSupportedProjectsSummaryResult {
  data: CompanySupportedProjectsSummary
  loading: boolean
  error: string | null
}

const emptySummary: CompanySupportedProjectsSummary = {
  active: 0,
  incentiveLaws: 0,
  privateInvestment: 0,
}

export function useSupportedProjectsSummary(): UseSupportedProjectsSummaryResult {
  const { getAccessTokenSilently } = useAuth0()
  const [data, setData] = useState<CompanySupportedProjectsSummary>(emptySummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()
        const summary = await fetchCompanySupportedProjectsSummary(token)

        if (cancelled) return
        setData(summary)
        setError(null)
      } catch (e) {
        if (!cancelled) {
          setData(emptySummary)
          setError(
            e instanceof Error
              ? e.message
              : "Erro ao carregar projetos apoiados",
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadSummary()

    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently])

  return { data, loading, error }
}
