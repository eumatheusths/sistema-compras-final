"use client";

import { useState, useMemo } from "react";

interface Compra {
  id: number;
  empresa: string;
  fornecedor: string;
  nfe: string;
  descricaoItem: string;
  data: string;
  valorTotal: number;
}

export default function ProdutosClient({ dadosIniciais }: { dadosIniciais: Compra[] }) {
  const [buscaMaster, setBuscaMaster] = useState("");
  const [fornecedoresAbertos, setFornecedoresAbertos] = useState<Record<string, boolean>>({});

  const toggleFornecedor = (chave: string) => {
    setFornecedoresAbertos((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  const dadosEstruturados = useMemo(() => {
    const empresasUnicas = Array.from(new Set(dadosIniciais.map((d) => d.empresa))).sort();
    const termo = buscaMaster.toLowerCase().trim();
    
    return empresasUnicas.map((empresa) => {
      const dadosEmpresa = dadosIniciais.filter((d) => d.empresa === empresa);
      const dadosFiltrados = dadosEmpresa.filter((item) =>
        !termo ||
        (item.descricaoItem || "").toLowerCase().includes(termo) ||
        (item.fornecedor || "").toLowerCase().includes(termo) ||
        (item.nfe || "").toLowerCase().includes(termo)
      );

      if (termo && dadosFiltrados.length === 0) return null;

      const fornecedoresMap = dadosFiltrados.reduce((acc, item) => {
        const nomeForn = item.fornecedor || "Desconhecido";
        if (!acc[nomeForn]) acc[nomeForn] = [];
        acc[nomeForn].push(item);
        return acc;
      }, {} as Record<string, Compra[]>);

      return {
        nomeEmpresa: empresa,
        total: dadosFiltrados.reduce((acc, item) => acc + item.valorTotal, 0),
        fornecedores: Object.entries(fornecedoresMap).map(([nomeFornecedor, itens]) => ({
          nome: nomeFornecedor,
          itens: itens,
          total: itens.reduce((acc, i) => acc + i.valorTotal, 0),
        })).sort((a, b) => b.total - a.total),
      };
    }).filter(Boolean); 
  }, [dadosIniciais, buscaMaster]);

  const toBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER & BUSCA */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">Explorador de Produtos</h1>
        
        <div className="relative group">
          <input
            type="text"
            placeholder="Digite nome do produto, nfe ou fornecedor..."
            value={buscaMaster}
            onChange={(e) => setBuscaMaster(e.target.value)}
            className="w-full pl-14 pr-6 py-5 text-lg bg-slate-950/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-white transition-all placeholder:text-slate-600"
          />
          <span className="absolute left-5 top-5 text-slate-500 text-2xl group-focus-within:text-emerald-400">🔍</span>
        </div>
      </div>

      {/* LISTA HIERÁRQUICA */}
      <div className="space-y-8">
        {dadosEstruturados.map((grupoEmpresa: any) => (
          <div key={grupoEmpresa.nomeEmpresa} className="bg-slate-800/20 border border-white/5 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
            
            {/* CABEÇALHO EMPRESA */}
            <div className="bg-slate-900/90 p-6 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-2xl">🏢</div>
                <h2 className="text-xl font-bold text-white tracking-wide">{grupoEmpresa.nomeEmpresa}</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block uppercase tracking-widest mb-1">Total Filtrado</span>
                <span className="text-emerald-400 font-mono font-bold text-xl drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                  {toBRL(grupoEmpresa.total)}
                </span>
              </div>
            </div>

            {/* LISTA DE FORNECEDORES */}
            <div className="p-6 grid gap-4">
              {grupoEmpresa.fornecedores.map((fornecedor: any, idx: number) => {
                const chaveAccordion = `${grupoEmpresa.nomeEmpresa}-${fornecedor.nome}`;
                const estaAberto = fornecedoresAbertos[chaveAccordion] || buscaMaster.length > 0;

                return (
                  <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden transition-all hover:border-white/10">
                    <button 
                      onClick={() => toggleFornecedor(chaveAccordion)}
                      className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-slate-500 transition-transform duration-300 ${estaAberto ? 'rotate-90 text-emerald-400' : 'group-hover:text-white'}`}>▶</span>
                        <div>
                          <h3 className="font-bold text-slate-200 text-lg group-hover:text-white transition-colors">{fornecedor.nome}</h3>
                          <span className="text-xs text-slate-500 font-medium bg-slate-800/50 px-2 py-0.5 rounded-md border border-white/5">
                            {fornecedor.itens.length} itens encontrados
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-300 group-hover:text-white">{toBRL(fornecedor.total)}</span>
                    </button>

                    {/* TABELA DE ITENS */}
                    {estaAberto && (
                      <div className="border-t border-white/5 p-4 bg-black/20 animate-in slide-in-from-top-2">
                        <div className="overflow-x-auto rounded-lg border border-white/5">
                          <table className="w-full text-sm text-left text-slate-400">
                            <tbody className="divide-y divide-white/5">
                              {fornecedor.itens.map((item: Compra) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors bg-slate-900/30">
                                  <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-500">
                                    {new Date(item.data).toLocaleDateString('pt-BR')}
                                  </td>
                                  <td className="px-4 py-3 font-medium text-slate-300 w-full">
                                    {item.descricaoItem}
                                    <span className="block text-[10px] text-slate-600 mt-0.5">NFe: {item.nfe}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-500 whitespace-nowrap">
                                    {toBRL(item.valorTotal)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {dadosEstruturados.length === 0 && (
           <div className="text-center py-20 text-slate-500 font-light text-lg">Nenhum produto encontrado.</div>
        )}
      </div>
    </div>
  );
}