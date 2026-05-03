import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

type ProjectInfoGridProps = {
  targetAudience: string;
  scopeArea: string;
};

export function ProjectInfoGrid({ targetAudience, scopeArea }: ProjectInfoGridProps) {
  return (
    <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
      <div>
        <h3 className="text-base font-bold text-vinculo-dark mb-2 flex items-center gap-2">
          <PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} className="text-vinculo-dark" aria-hidden />
          Público-Alvo
        </h3>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{targetAudience}</p>
      </div>
      <div>
        <h3 className="text-base font-bold text-vinculo-dark mb-2">Área de Atuação</h3>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{scopeArea}</p>
      </div>
    </section>
  );
}
