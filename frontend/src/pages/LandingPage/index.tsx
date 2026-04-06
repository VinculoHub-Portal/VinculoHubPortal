import { Header } from "../../components/general/Header"
import InfoTab from "./info_tab"
import { Hero } from "../../pages/LandingPage/Hero";

export default function LandingPage() {
  return (
    <div>
      <Header />
      <Hero />
      <InfoTab />
    </div>
  )
}
