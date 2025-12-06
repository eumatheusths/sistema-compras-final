"use client";

import { useState, useMemo } from "react";

interface Compra {
  id: number;
  empresa: string;
  fornecedor: string;
  data: string;
  valorTotal: number;
}

export default function FornecedoresClient({ dadosIniciais }: { dadosIniciais: Compra[] }) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [buscaMaster, setBuscaMaster] = useState("");

  const dadosFiltrados = useMemo(() => {
    const inicio = dataInicio ? new Date(dataInicio).getTime() : 0;
    const fim = dataFim ? new Date(dataFim).setHours(23, 59, 59) : Infinity;
    const termo = buscaMaster.toLowerCase().trim();

    return dadosIniciais.filter((item) => {
      const dataItem = new Date(item.data).getTime();
      const matchData = dataItem >= inicio && dataItem <= fim;
      const fornecedorNome = item.fornecedor || "";
      const matchTexto = !termo || fornecedorNome.toLowerCase().includes(termo);
      return matchData && matchTexto;
    });
  }, [dadosIniciais, dataInicio, dataFim, buscaMaster]);

  const rankingFornecedores = useMemo(() => {
    const agrupado = dadosFiltrados.reduce((acc, item) => {
      const nome = item.fornecedor || "Desconhecido";
      acc[nome] = (acc[nome] || 0) + item.valorTotal; 
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agrupado)
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [dadosFiltrados]);

  const totalGeralPeriodo = rankingFornecedores.reduce((acc, item) => acc + item.total, 0);
  const toBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">Fornecedores</h1>
           <p className="text-slate-400 mt-2 text-lg">Ranking de parceiros e volume de compras.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">Total no Período</span>
          <span className="text-3xl font-mono font-bold text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10 inline-block shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            {toBRL(totalGeralPeriodo)}
          </span>
        </div>
      </div>

      {/* FILTROS (GLASS) */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col xl:flex-row gap-6 items-end">
        <div className="w-full xl:w-1/3">
           <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Buscar Fornecedor</label>
           <div className="relative">
             <input 
               type="text" 
               placeholder="Digite o nome..." 
               value={buscaMaster}
               onChange={e => setBuscaMaster(e.target.value)}
               className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none text-slate-200 transition-all placeholder:text-slate-600"
             />
             <span className="absolute left-4 top-3.5 text-slate-500 text-lg">🔍</span>
           </div>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <div className="w-1/2">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full px-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl text-slate-300 outline-none focus:ring-2 focus:ring-purple-500/50 [color-scheme:dark]" />
          </div>
          <div className="w-1/2">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full px-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl text-slate-300 outline-none focus:ring-2 focus:ring-purple-500/50 [color-scheme:dark]" />
          </div>
        </div>
      </div>

      {/* CARDS FORNECEDORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rankingFornecedores.map((item, index) => (
          <div key={index} className="relative bg-slate-800/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl overflow-hidden group hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
            
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-400 shadow-inner">
                  #{index + 1}
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
                  {((item.total / (totalGeralPeriodo || 1)) * 100).toFixed(1)}%
                </span>
              </div>

              <h3 className="font-bold text-slate-200 text-lg leading-tight mb-4 truncate" title={item.nome}>
                {item.nome}
              </h3>

              <div className="space-y-2">
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Acumulado</p>
                 <p className="text-2xl font-bold text-white tracking-tight">{toBRL(item.total)}</p>
                 
                 {/* Barra de Progresso */}
                 <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden mt-3">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      style={{ width: `${(item.total / (totalGeralPeriodo || 1)) * 100}%` }}
                    />
                 </div>
              </div>
            </div>
          </div>
        ))}

        {rankingFornecedores.length === 0 && (
          <div className="col-span-full py-24 text-center bg-slate-900/50 rounded-3xl border border-white/5 border-dashed">
            <p className="text-xl text-slate-500 font-light">Nenhum fornecedor encontrado neste filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}