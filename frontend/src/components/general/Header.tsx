import { BaseButton } from "./BaseButton";


export function Header() {
  return (
    <header className="bg-vinculo-dark w-full px-8 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-2 text-white text-xl font-bold italic">
        <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
           <span className="text-sm">🌐</span>
        </div>
        VinculoHub<span className="text-vinculo-green">Portal</span>
      </div>
      
      <div className="flex gap-4">
        <BaseButton variant="outline" className="border-white text-white hover:bg-white/10">
          Cadastro
        </BaseButton>
        <BaseButton className="bg-white text-vinculo-dark hover:bg-gray-100">
          Entrar
        </BaseButton>
      </div>
    </header>
  );
}