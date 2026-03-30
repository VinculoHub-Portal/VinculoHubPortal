import { Header } from "../../components/general/Header";
import { BaseButton } from "../../components/general//BaseButton";
import { Input } from "../../components/general/SimpleTextInput";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      
      <Header />
   

      <main className="max-w-4xl mx-auto w-full flex flex-col gap-12 px-6">
        
        
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-vinculo-dark text-xl font-bold mb-6 border-b pb-2">Formulário & Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              id="email"
              label="E-mail *" 
              placeholder="seu@email.com" 
              type="email" 
            />
            <Input 
              id="password"
              label="Senha *" 
              placeholder="........" 
              type="password" 
            />
            <Input 
              id="empresa"
              label="Razão Social" 
              placeholder="Digite a razão social" 
            />
            <Input 
              id="fantasia"
              label="Nome Fantasia" 
              placeholder="Digite o nome fantasia" 
            />
          </div>
        </section>

        
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-vinculo-dark text-xl font-bold mb-6 border-b pb-2">Galeria de Botões</h2>
          
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500">Primary (Login)</span>
              <BaseButton variant="primary">Entrar</BaseButton>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500">Secondary (Wizard)</span>
              <BaseButton variant="secondary">Próximo</BaseButton>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500">Ghost (Voltar)</span>
              <BaseButton variant="ghost">Voltar</BaseButton>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500">Outline</span>
              <BaseButton variant="outline">Criar Conta</BaseButton>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <span className="text-xs text-slate-500">Full Width (Mobile/Login)</span>
            <BaseButton variant="primary" fullWidth>
              Acessar Portal VinculoHub
            </BaseButton>
          </div>
        </section>

      </main>
    </div>
  );
}