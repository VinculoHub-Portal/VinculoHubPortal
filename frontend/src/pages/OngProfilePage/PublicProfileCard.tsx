import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import { useState } from "react"
import { BaseButton } from "../../components/general/BaseButton"

interface PublicProfileCardProps {
  slug: string
}

export function PublicProfileCard({ slug }: PublicProfileCardProps) {
  const [copied, setCopied] = useState(false)
  const publicUrl = `${window.location.origin}/ong/publico/${slug}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available — silently ignore
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2 mb-1">
        <LanguageOutlinedIcon fontSize="small" className="text-vinculo-dark" />
        <h2 className="text-base font-semibold text-vinculo-dark">Perfil Público</h2>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        Seu perfil pode ser acessado através de um link público. Você pode compartilhar
        este link com empresas e parceiros externos.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          readOnly
          value={publicUrl}
          aria-label="Link do perfil público"
          className="flex-1 rounded-xl border border-vinculo-gray bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
        />
        <BaseButton variant="primary" onClick={handleCopy}>
          {copied ? "Copiado!" : "Copiar Link"}
        </BaseButton>
      </div>
    </article>
  )
}
