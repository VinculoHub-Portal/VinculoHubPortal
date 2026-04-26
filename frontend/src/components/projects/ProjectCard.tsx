import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { BaseButton } from "../general/BaseButton";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
  type ProjectListItem,
  type ProjectStatus,
} from "../../types/project.types";
import { ProjectProgress } from "./ProjectProgress";

interface ProjectCardProps {
  project: ProjectListItem;
  onViewDetails?: (projectId: string) => void;
}

const statusClassNames: Record<ProjectStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-sky-100 text-sky-700",
  cancelled: "bg-slate-200 text-slate-700",
};

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-4 py-1 text-sm font-semibold ${statusClassNames[project.status]}`}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
        <span className="rounded-full bg-slate-100 px-4 py-1 text-sm font-medium text-slate-600">
          {PROJECT_TYPE_LABELS[project.type]}
        </span>
      </div>

      <div className="mt-5">
        <h2 className="text-3xl font-bold text-vinculo-dark">{project.name}</h2>

        <div className="mt-3 flex items-center gap-2 text-slate-500">
          <LocationOnOutlinedIcon fontSize="small" />
          <span>{project.city}, {project.state}</span>
        </div>

        <p className="mt-5 text-lg leading-8 text-slate-600">{project.description}</p>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <ProjectProgress value={project.progress} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6">
        <BaseButton
          variant="outline"
          fullWidth
          className="min-h-12"
          onClick={() => onViewDetails?.(project.id)}
        >
          <VisibilityOutlinedIcon fontSize="small" />
          Ver detalhes
        </BaseButton>
      </div>
    </article>
  );
}
