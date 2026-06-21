import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { useEffect, useRef, useState } from "react"
import { BaseButton } from "../general/BaseButton"

export interface ProporParceriaProject {
  id: number
  title: string
}

type ProporParceriaModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (projectId: number) => void
  loading: boolean
  projects: ProporParceriaProject[]
  companyName: string
}

export function ProporParceriaModal(props: ProporParceriaModalProps) {
  if (!props.open) return null
  return <ProporParceriaModalContent {...props} />
}

function ProporParceriaModalContent({
  onClose,
  onConfirm,
  loading,
  projects,
  companyName,
}: ProporParceriaModalProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [loading, onClose])

  useEffect(() => {
    if (!dropdownOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const selectedProject = projects.find((p) => p.id === selected) ?? null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="propor-parceria-title"
      data-testid="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
    >
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <HandshakeOutlinedIcon
              className="text-vinculo-green"
              fontSize="large"
            />
          </div>
          <h2
            id="propor-parceria-title"
            className="text-xl font-bold text-vinculo-dark"
          >
            Propor Parceria
          </h2>
          <p className="text-sm leading-6 text-slate-500">
            Você está propondo uma parceria com{" "}
            <span className="font-semibold text-slate-700">{companyName}</span>.
            Selecione um dos seus projetos ativos para vincular.
          </p>
        </div>

        <div ref={dropdownRef} className="relative">
          <label
            htmlFor="propor-parceria-projeto"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Projeto
          </label>
          <button
            id="propor-parceria-projeto"
            type="button"
            role="combobox"
            aria-expanded={dropdownOpen}
            aria-controls="propor-parceria-projeto-list"
            aria-haspopup="listbox"
            disabled={loading || projects.length === 0}
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:border-slate-400 focus:border-vinculo-dark focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <span>
              {selectedProject ? selectedProject.title : "Selecione um projeto"}
            </span>
            <KeyboardArrowDownIcon
              fontSize="small"
              className={`text-slate-400 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {dropdownOpen && projects.length > 0 && (
            <ul
              id="propor-parceria-projeto-list"
              role="listbox"
              className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            >
              {projects.map((p) => (
                <li
                  key={p.id}
                  role="option"
                  aria-selected={selected === p.id}
                  onClick={() => {
                    setSelected(p.id)
                    setDropdownOpen(false)
                  }}
                  className={`cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-slate-50 ${
                    selected === p.id
                      ? "bg-vinculo-dark/5 text-vinculo-dark"
                      : "text-slate-700"
                  }`}
                >
                  {p.title}
                </li>
              ))}
            </ul>
          )}
          {projects.length === 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Você não tem projetos disponíveis para propor parceria com esta empresa.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            type="button"
            variant="ghost"
            className="w-full bg-transparent! text-slate-600! hover:bg-slate-100! sm:w-fit"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="button"
            variant="secondary"
            className="w-full py-2 hover:opacity-90! sm:w-fit"
            onClick={() => selected !== null && onConfirm(selected)}
            disabled={loading || selected === null}
          >
            {loading ? "Confirmando..." : "Confirmar"}
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
