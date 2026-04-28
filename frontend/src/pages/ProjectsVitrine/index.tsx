import ProjectCard from "../../components/projects/ProjectCard";
import { allProjects, suggestedProjects } from "../../components/projects/mockProjects";
import { Header } from "../../components/general/Header";
import { BaseButton } from "../../components/general/BaseButton";
import { Link } from "react-router-dom";

export function ProjectsVitrine() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="mb-8" aria-labelledby="todos-projetos-title">
          <div className="flex justify-between items-center mb-6">
            <h2 id="todos-projetos-title" className="text-2xl font-bold text-vinculo-dark">Todos os Projetos</h2>
            <span className="text-sm text-slate-500" aria-live="polite">{allProjects.length} projetos encontrados</span>
          </div>

          {allProjects.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4" />
              </svg>
              <h3 className="text-lg font-semibold text-vinculo-dark mb-2">Nenhum projeto encontrado</h3>
              <p className="text-sm text-slate-600 mb-4">Ainda não há projetos públicos cadastrados aqui. Você pode explorar outras áreas ou criar um novo projeto.</p>
              <div className="flex justify-center">
                <Link to="/">
                  <BaseButton variant="primary">Explorar projetos</BaseButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProjects.map((p) => (
                <ProjectCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="projetos-sugeridos-title">
          <div className="flex justify-between items-center mb-6">
            <h2 id="projetos-sugeridos-title" className="text-2xl font-bold text-vinculo-dark">Todos os Projetos Sugeridos</h2>
            <span className="text-sm text-slate-500" aria-live="polite">{suggestedProjects.length} projetos encontrados</span>
          </div>

          {suggestedProjects.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <h3 className="text-lg font-semibold text-vinculo-dark mb-2">Nenhum projeto sugerido</h3>
              <p className="text-sm text-slate-600 mb-4">No momento não há recomendações automáticas para você.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedProjects.map((p) => (
                <ProjectCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProjectsVitrine;
