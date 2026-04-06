import { Header } from "../../components/general/Header"
import InfoTab from "./info_tab"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />
      <InfoTab />
    </div>
  )
}

export default LandingPage