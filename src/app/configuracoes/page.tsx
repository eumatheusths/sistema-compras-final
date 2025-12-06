import ConfiguracoesClient from "@/components/ConfiguracoesClient";

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Configurações do Sistema</h1>
        <p className="text-slate-500">Gerenciamento de acessos e permissões.</p>
      </div>
      <ConfiguracoesClient />
    </div>
  );
}