import { useAuth0 } from "@auth0/auth0-react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import { useEffect, useState } from "react";
import { fetchAllNpos, type NpoExportData } from "../../api/admin";
import { Header } from "../../components/general/Header";

const NPO_SIZE_LABELS: Record<NonNullable<NpoExportData["npoSize"]>, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

export function AdminOngsList() {
  const { getAccessTokenSilently } = useAuth0();
  const [npos, setNpos] = useState<NpoExportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = await getAccessTokenSilently();
        const data = await fetchAllNpos(token);
        if (isMounted) setNpos(data);
      } catch {
        if (isMounted) setError("Não foi possível carregar a lista de ONGs.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [getAccessTokenSilently]);

  const filtered = nameFilter
    ? npos.filter((n) => n.name.toLowerCase().includes(nameFilter.toLowerCase()))
    : npos;

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4">
          <a
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-vinculo-dark"
          >
            <ArrowBackOutlinedIcon fontSize="small" />
            Voltar ao painel
          </a>

          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-vinculo-dark/10 text-vinculo-dark">
              <CorporateFareOutlinedIcon fontSize="small" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-vinculo-dark">ONGs cadastradas</h1>
              <p className="text-sm text-slate-500">
                {loading ? "Carregando..." : `${npos.length} organização${npos.length !== 1 ? "ões" : ""} no total`}
              </p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Filtrar por nome"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-vinculo-dark focus:ring-2 focus:ring-vinculo-dark/20"
          />
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && (
            <div className="p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mb-4 h-10 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="p-6 text-sm font-medium text-vinculo-red" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="p-6 text-sm text-slate-500">Nenhuma ONG encontrada.</p>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-slate-500">
                    <th scope="col" className="px-6 py-3 font-semibold">Nome</th>
                    <th scope="col" className="px-4 py-3 font-semibold">CNPJ / CPF</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Porte</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Localização</th>
                    <th scope="col" className="px-4 py-3 font-semibold">ESG</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((npo) => (
                    <tr key={npo.id} className="text-slate-700 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-vinculo-dark">{npo.name}</td>
                      <td className="px-4 py-4 text-slate-500">
                        {npo.cnpj ?? npo.cpf ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        {npo.npoSize ? NPO_SIZE_LABELS[npo.npoSize] : "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {npo.city && npo.state ? `${npo.city}, ${npo.state}` : npo.city ?? npo.state ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          {npo.environmental && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">E</span>
                          )}
                          {npo.social && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">S</span>
                          )}
                          {npo.governance && (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">G</span>
                          )}
                          {!npo.environmental && !npo.social && !npo.governance && (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
                          new Date(npo.createdAt),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
