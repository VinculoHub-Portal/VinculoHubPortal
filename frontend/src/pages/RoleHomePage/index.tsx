import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { BaseButton } from "../../components/general/BaseButton";
import { Header } from "../../components/general/Header";
import {
  CreateProjectModal,
  type CreateProjectFormData,
} from "../../components/ong/CreateProjectModal";

type RoleHomePageProps = {
  title: string;
  description: string;
  showCreateProjectAction?: boolean;
};

export function RoleHomePage({
  title,
  description,
  showCreateProjectAction = false,
}: RoleHomePageProps) {
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);

  function handleCreateProject(data: CreateProjectFormData) {
    void data;
    setIsCreateProjectModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="max-w-4xl mx-auto w-full px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-vinculo-dark">{title}</h1>
            <p className="mt-4 text-slate-700">{description}</p>
          </div>

          {showCreateProjectAction && (
            <BaseButton
              type="button"
              variant="secondary"
              className="w-full py-3 md:w-fit"
              onClick={() => setIsCreateProjectModalOpen(true)}
            >
              <AddIcon fontSize="small" />
              Cadastrar Novo Projeto
            </BaseButton>
          )}
        </div>

      </main>

      <CreateProjectModal
        open={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
