import { useAuth0 } from "@auth0/auth0-react";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import { useEffect, useState } from "react";
import { fetchAdminVinculos, type AdminVinculoItem, type VinculoStatus } from "../../api/admin";
import { Header } from "../../components/general/Header";

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<VinculoStatus, string> = {
  pending: "Pendente",
  negotiation: "Em negociação",
  active: "Ativo",
  inactive: "Inativo",
};

const STATUS_STYLES: Record<VinculoStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  negotiation: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-500",
};

export function AdminVinculosList() {
  const { getAccessTokenSilently } = useAuth0();
  const [vinculos, setVinculos] = useState<AdminVinculoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = await getAccessTokenSilently();
        const data = await fetchAdminVinculos(token, page, PAGE_SIZE);
        if (isMounted) {
          setVinculos(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        }
      } catch {
        if (isMounted) setError("Não foi possível carregar os vínculos.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [getAccessTokenSilently, page]);

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
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <HubOutlinedIcon fontSize="small" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-vinculo-dark">Vínculos</h1>
              <p className="text-sm text-slate-500">
                {loading ? "Carregando..." : `${totalElements} vínculo${totalElements !== 1 ? "s" : ""} no total`}
              </p>
            </div>
          </div>
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

          {!loading && !error && vinculos.length === 0 && (
            <p className="p-6 text-sm text-slate-500">Nenhum vínculo encontrado.</p>
          )}

          {!loading && !error && vinculos.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-500">
                      <th scope="col" className="px-6 py-3 font-semibold">Empresa</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Projeto</th>
                      <th scope="col" className="px-4 py-3 font-semibold">ONG</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Criado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vinculos.map((v) => (
                      <tr key={`${v.companyId}-${v.projectId}`} className="text-slate-700 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-vinculo-dark">{v.companyName}</td>
                        <td className="px-4 py-4">{v.projectTitle}</td>
                        <td className="px-4 py-4 text-slate-500">{v.npoName}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[v.status]}`}
                          >
                            {STATUS_LABELS[v.status]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
                            new Date(v.createdAt),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-600">
                <span>{totalElements} resultado{totalElements !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Anterior
                  </button>
                  <span>Página {page + 1} de {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
