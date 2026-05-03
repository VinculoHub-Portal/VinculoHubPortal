import { useState } from "react";
import { Header } from "../../components/general/Header";
import {
  CreateProjectModal,
  type CreateProjectFormData,
} from "../../components/ong/CreateProjectModal";
import { OngDashboardMock } from "./OngDashboardMock";

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

  if (showCreateProjectAction) {
    return (
      <>
        <OngDashboardMock
          onCreateProject={() => setIsCreateProjectModalOpen(true)}
        />
        <CreateProjectModal
          open={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      </>
    );
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
        </div>

      </main>
    </div>
  );
}
