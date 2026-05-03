import { useState } from "react";
import { Header } from "../../components/general/Header";
import { BaseButton } from "../../components/general/BaseButton";
import { ModalNewProject } from "../../components/modal/ModalNewProject";
import type { FieldErrors, ProjectOdsOption } from "../../types/wizard.types";

type ProjectFormData = {
  nomeProjeto: string;
  descricaoProjeto: string;
  metaCaptacao: string;
  odsProjeto: ProjectOdsOption[];
};

const emptyProjectFormData: ProjectFormData = {
  nomeProjeto: "",
  descricaoProjeto: "",
  metaCaptacao: "",
  odsProjeto: [],
};

export function NewProjectModalPage() {
  const [open, setOpen] = useState(true);
  const [formData, setFormData] = useState<ProjectFormData>(emptyProjectFormData);
  const [errors, setErrors] = useState<
    Pick<FieldErrors, "nomeProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto">
  >({});

  function handleConfirm() {
    const nextErrors: Pick<
      FieldErrors,
      "nomeProjeto" | "descricaoProjeto" | "metaCaptacao" | "odsProjeto"
    > = {};

    if (!formData.nomeProjeto.trim()) {
      nextErrors.nomeProjeto = "Informe o nome do projeto.";
    }

    if (!formData.descricaoProjeto.trim()) {
      nextErrors.descricaoProjeto = "Informe a descrição do projeto.";
    }

    if (formData.metaCaptacao.trim() && Number.isNaN(Number(formData.metaCaptacao))) {
      nextErrors.metaCaptacao = "Informe uma meta de captação válida.";
    }

    if (formData.odsProjeto.length === 0) {
      nextErrors.odsProjeto = "Selecione ao menos um ODS.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Página de teste
          </p>
          <h1 className="mt-2 text-2xl font-bold text-vinculo-dark">
            Modal de novo projeto
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Esta tela abre o modal automaticamente para validar o layout, o
            foco e o formulário do projeto sem passar pelo fluxo completo.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <BaseButton
              variant="secondary"
              onClick={() => setOpen(true)}
              disabled={open}
            >
              Reabrir modal
            </BaseButton>
          </div>
        </section>
      </main>

      <ModalNewProject
        open={open}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
