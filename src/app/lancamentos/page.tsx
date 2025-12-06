import { getDadosPlanilha } from "@/lib/google-sheets";

export const dynamic = 'force-dynamic';

export default async function LancamentosPage() {
  const compras = await getDadosPlanilha();

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Últimos Lançamentos</h1>
        <p className="text-slate-400">Registro completo de movimentações importadas.</p>
      </div>

      {/* Tabela */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-white/5 text-slate-200 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {compras.map((c: any) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500 group-hover:text-slate-300">
                    {new Date(c.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-300">
                    {c.empresa}
                  </td>
                  <td className="px-6 py-4">
                    {c.fornecedor}
                  </td>
                  <td className="px-6 py-4 truncate max-w-[300px]" title={c.descricaoItem}>
                    {/* AQUI ESTAVA O ERRO: Mudamos de c.descricao para c.descricaoItem */}
                    {c.descricaoItem}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-200 group-hover:text-emerald-400">
                    {c.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
              {compras.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-600 bg-slate-950/30">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}