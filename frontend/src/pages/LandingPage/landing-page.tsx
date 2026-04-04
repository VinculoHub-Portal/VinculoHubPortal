// A parent page that renders two internal "subpages" as a single page
import { Header } from "../../components/general/Header";
function SubPageOne() {
  return (
    <section className="p-4 border-b">
      <h2 className="text-lg font-semibold">SubPage One</h2>
      <p>Conteúdo da primeira subpágina</p>
    </section>
  );
}

function SubPageTwo() {
  return (
    <section className="p-4">
      <h2 className="text-lg font-semibold">SubPage Two</h2>
      <p>Conteúdo da segunda subpágina</p>
    </section>
  );
}

export default function LandingPage({ showFirst = true, showSecond = true }) {
  // If neither should be shown, return nothing
  if (!showFirst && !showSecond) return null;

  return (
    <><Header />
    <div className="p-6 space-y-4">
          {showFirst && <SubPageOne />}
          {showSecond && <SubPageTwo />}
      </div></>
  );
}

// --- Example route usage (React Router) ---
// This is NOT a full App, just how you would register the route

/*
import { Route } from "react-router-dom";
import CombinedPage from "./CombinedPage";

<Route path="/combined" element={<CombinedPage showFirst={true} showSecond={true} />} />
*/