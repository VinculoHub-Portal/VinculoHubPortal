import { IncentiveCard } from "../../components/general/IncentiveCard"
import { InvestmentCard } from "../../components/general/InvestmentCard"

export function InvestmentModalitiesSection() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-medium leading-9 text-vinculo-dark">
        Modalidades de Investimento
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncentiveCard />
        <InvestmentCard />
      </div>
    </section>
  )
}
