<<<<<<< HEAD
import LandingPage from "./landing-page";
export default function LandingPageIndex() {
  return <LandingPage/>;
}
=======
import { Header } from "../../components/general/Header"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />
      <h1>Landing Page</h1>
    </div>
  )
}
>>>>>>> 3c1cdf241fde3b6765ba4aea0b8286f5ceb1391c
