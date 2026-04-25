import { Header } from "../../components/general/Header";
import InfoTab from "./InfoTab";
import { Hero } from "./Hero";

export default function LandingPage() {
  return (
    <div className="pb-6">
      <Header />
      <Hero />
      <InfoTab />
    </div>
  );
}
