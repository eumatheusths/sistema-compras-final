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

export default function RelatoriosClient({ dadosIniciais }: { dadosIniciais: Compra[] }) {
  const hoje = new Date().toISOString().split("T")[0];
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(trintaDiasAtras);
  const [dataFim, setDataFim] = useState(hoje);
  const [filtroTexto, setFiltroTexto] = useState("");

  const dadosFiltrados = useMemo(() => {
    const inicio = dataInicio ? new Date(dataInicio).getTime() : 0;
    const fim = dataFim ? new Date(dataFim).setHours(23, 59, 59) : Infinity;
    const texto = filtroTexto.toLowerCase().trim();

    return dadosIniciais.filter((item) => {
      const dataItem = new Date(item.data).getTime();
      const matchData = dataItem >= inicio && dataItem <= fim;
      const matchTexto = 
        !texto || 
        item.empresa.toLowerCase().includes(texto) ||
        item.fornecedor.toLowerCase().includes(texto) ||
        item.nfe.toLowerCase().includes(texto) ||
        (item.descricaoItem || "").toLowerCase().includes(texto);

      return matchData && matchTexto;
    });
  }, [dadosIniciais, dataInicio, dataFim, filtroTexto]);

  const totalPeriodo = dadosFiltrados.reduce((acc, item) => acc + item.valorTotal, 0);
  const toBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in duration-700">
      
      {/* CSS DE IMPRESSÃO (Mantém impressão branca para economizar tinta) */}
      <style jsx global>{`
        @media print {
          aside, .no-print { display: none !important; }
          body, main { background: white !important; margin: 0 !important; padding: 0 !important; color: black !important; }
          .print-container { border: none !important; width: 100% !important; background: white !important; }
          table { font-size: 10pt !important; color: black !important; }
          td, th { padding: 4px !important; border-bottom: 1px solid #ddd !important; }
          tr { background: white !important; }
        }
      `}</style>

      {/* CONTROLES */}
      <div className="p-8 border-b border-white/5 flex flex-col xl:flex-row gap-8 justify-between items-end no-print bg-slate-950/30">
        <div className="flex gap-4 w-full xl:w-auto">
          <div className="w-1/2 xl:w-auto">
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2 tracking-wider">De</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]" />
          </div>
          <div className="w-1/2 xl:w-auto">
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2 tracking-wider">Até</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]" />
          </div>
        </div>

        <div className="flex gap-4 w-full xl:w-1/2 justify-end items-end">
           <div className="w-full relative group">
             <label className="text-xs font-bold text-slate-400 uppercase block mb-2 tracking-wider">Filtrar Tabela</label>
             <input 
              type="text" 
              placeholder="Digite para buscar..." 
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 outline-none text-white transition-all"
             />
             <span className="absolute left-3 top-9 text-slate-500 group-focus-within:text-cyan-400">🔍</span>
           </div>
           
           <button 
             onClick={() => window.print()}
             className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)] h-[50px]"
           >
             🖨️ <span className="hidden sm:inline">Imprimir</span>
           </button>
        </div>
      </div>

      {/* BARRA TOTAL */}
      <div className="bg-slate-900/80 px-8 py-4 border-b border-white/5 flex justify-between items-center print-header">
        <div>
          <h2 className="text-xl font-bold text-white">Relatório Analítico</h2>
          <p className="text-xs text-slate-500 font-mono hidden print:block">Gerado em: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase text-slate-400 block tracking-widest">Total Geral</span>
          <span className="text-2xl font-mono font-bold text-cyan-400">{toBRL(totalPeriodo)}</span>
        </div>
      </div>

      {/* TABELA DARK */}
      <div className="overflow-x-auto print-container">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-white/5 text-slate-200 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Fornecedor</th>
              <th className="px-6 py-4">NFe</th>
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dadosFiltrados.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500 group-hover:text-slate-300">
                  {new Date(item.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 font-medium text-slate-300">{item.empresa}</td>
                <td className="px-6 py-4">{item.fornecedor}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500 bg-black/20 rounded w-fit px-2 py-1">
                  {item.nfe}
                </td>
                <td className="px-6 py-4 truncate max-w-[250px]" title={item.descricaoItem}>
                  {item.descricaoItem}
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-slate-200 group-hover:text-cyan-400">
                  {toBRL(item.valorTotal)}
                </td>
              </tr>
            ))}
            {dadosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="p-16 text-center text-slate-600 bg-slate-950/30">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}