import { Link } from "react-router-dom";
import { useState } from "react";
import { BaseButton } from "./BaseButton";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-vinculo-dark w-full shadow-md relative z-50">
      <div className="px-6 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white text-xl font-bold">
          <span className="text-sm">🌐</span>
          VinculoHub<span className="text-vinculo-green">Portal</span>
        </div>

        <div className="hidden md:flex gap-4">
          <Link to="/cadastro">
            <BaseButton
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Cadastro
            </BaseButton>
          </Link>

          <BaseButton className="bg-white !text-vinculo-dark hover:bg-gray-100">
            Entrar
          </BaseButton>
        </div>
        <button
          className="md:hidden text-white font-bold text-2xl w-8 h-8 flex items-center justify-center border border-white/20 rounded"
          onClick={toggleMenu}
          aria-label="Abrir menu"
        >
          {isMenuOpen ? "X" : "H"}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-vinculo-dark border-t border-white/10 px-6 py-8 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <BaseButton
            variant="outline"
            fullWidth
            className="border-white text-white rounded-full py-3"
          >
            Cadastro
          </BaseButton>

          <BaseButton
            fullWidth
            className="!bg-white !text-vinculo-dark rounded-full py-3"
          >
            Entrar
          </BaseButton>
        </div>
      )}
    </header>
  );
}
