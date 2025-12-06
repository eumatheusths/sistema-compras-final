"use client";

import { useState, useMemo, useRef } from "react";
import * as XLSX from 'xlsx';

interface Compra {
  id: number;
  empresa: string;
  fornecedor: string;
  descricaoItem: string;
  planoContas: string;
  categoria: string;
  unidade: string;
  quantidade: string;
  valorUnitario: number;
  valorTotal: number;
  data: string;
  nfe: string;
}

export default function DashboardClient({ dadosIniciais }: { dadosIniciais: Compra[] }) {
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggle = (id: string) => setAbertos(prev => ({ ...prev, [id]: !prev[id] }));
  const toBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportando(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
      const response = await fetch('/api/importar', { method: 'POST', body: JSON.stringify({ dadosNovos: jsonData }) });
      const res = await response.json();
      if (res.success) {
        alert(`✅ Sucesso! +${res.novosAdicionados} itens.`);
        window.location.reload();
      } else alert("Erro: " + res.error);
    } catch (e) { alert("Erro ao ler arquivo."); }
    setImportando(false);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const dadosFiltrados = useMemo(() => {
    const inicio = dataInicio ? new Date(dataInicio).getTime() : 0;
    const fim = dataFim ? new Date(dataFim).setHours(23, 59, 59) : Infinity;
    const termo = busca.toLowerCase().trim();
    return dadosIniciais.filter(i => {
      const d = new Date(i.data).getTime();
      return (d >= inicio && d <= fim) && (!termo || JSON.stringify(i).toLowerCase().includes(termo));
    });
  }, [dadosIniciais, busca, dataInicio, dataFim]);

  const rankingEmpresas = useMemo(() => {
    const agg = dadosFiltrados.reduce((acc, i) => { acc[i.empresa] = (acc[i.empresa] || 0) + i.valorTotal; return acc; }, {} as any);
    return Object.entries(agg).map(([n, t]: any) => ({ nome: n, total: t })).sort((a: any, b: any) => b.total - a.total);
  }, [dadosFiltrados]);

  const totalGeral = rankingEmpresas.reduce((acc: number, i: any) => acc + i.total, 0);

  const estruturaReversa = useMemo(() => {
    const arvore: any = {};
    dadosFiltrados.forEach(i => {
      const p = i.planoContas || "Outros", q = i.categoria || "Geral", b = i.fornecedor || "Desconhecido";
      if (!arvore[p]) arvore[p] = { total: 0, cats: {} };
      if (!arvore[p].cats[q]) arvore[p].cats[q] = { total: 0, forns: {} };
      if (!arvore[p].cats[q].forns[b]) arvore[p].cats[q].forns[b] = { total: 0, mats: {} };
      
      arvore[p].total += i.valorTotal; arvore[p].cats[q].total += i.valorTotal; arvore[p].cats[q].forns[b].total += i.valorTotal;
      
      const key = `${i.descricaoItem}__${i.unidade}`;
      if (!arvore[p].cats[q].forns[b].mats[key]) arvore[p].cats[q].forns[b].mats[key] = { desc: i.descricaoItem, un: i.unidade, qtd: 0, val: 0, count: 0 };
      
      const qtd = parseFloat(String(i.quantidade).replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
      const m = arvore[p].cats[q].forns[b].mats[key];
      m.qtd += qtd; m.val += i.valorTotal; m.count++;
    });
    return Object.entries(arvore).sort((a: any, b: any) => b[1].total - a[1].total);
  }, [dadosFiltrados]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">Dashboard Financeiro</h1>
           <p className="text-slate-400 mt-1">Visão geral de custos e performance.</p>
        </div>
        <div>
          <input type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importando}
            className={`px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ${importando ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border border-emerald-400/20'}`}
          >
            {importando ? "Processando..." : "📂 Importar Planilha"}
          </button>
        </div>
      </div>

      {/* FILTROS GLASSMORPHISM */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-2xl flex flex-col xl:flex-row gap-6 items-end">
        <div className="w-full xl:w-1/3">
          <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Busca Global</label>
          <div className="relative group">
            <input
              type="text"
              placeholder="Pesquise qualquer coisa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none text-slate-200 transition-all placeholder:text-slate-600"
            />
            <span className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 text-lg">🔍</span>
          </div>
        </div>
        <div className="flex gap-4 w-full xl:w-auto">
           <div className="w-1/2">
             <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Início</label>
             <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]" />
           </div>
           <div className="w-1/2">
             <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Fim</label>
             <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full px-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500/50 [color-scheme:dark]" />
           </div>
        </div>
      </div>

      {/* CARDS COM GLOW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rankingEmpresas.map((item: any, idx: number) => (
          <div key={idx} className="relative bg-slate-800/30 backdrop-blur-md border border-white/5 p-6 rounded-2xl overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
            {/* Efeito Glow no Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">{item.nome}</h3>
                <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/20">
                  {((item.total / (totalGeral || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{toBRL(item.total)}</p>
              
              {/* Barra de Progresso */}
              <div className="w-full h-1.5 bg-slate-700/50 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                  style={{ width: `${(item.total / (totalGeral || 1)) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FLUXO HIERÁRQUICO */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"></span>
          Detalhamento de Custos
        </h2>
        
        {estruturaReversa.map(([plano, dados]: [string, any]) => (
          <div key={plano} className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            {/* CABEÇALHO PLANO */}
            <div className="bg-slate-800/80 px-6 py-5 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-2xl opacity-50">📂</span>
                <div>
                  <h3 className="font-bold text-xl text-white">{plano}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{Object.keys(dados.cats).length} categorias</p>
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-lg bg-emerald-500/10 px-4 py-1.5 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                {toBRL(dados.total)}
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {Object.entries(dados.cats).map(([cat, dCat]: [string, any]) => {
                const idCat = `${plano}-${cat}`;
                const isOpen = abertos[idCat] || busca.length > 0;

                return (
                  <div key={cat} className="bg-transparent">
                    <button 
                      onClick={() => toggle(idCat)}
                      className="w-full flex justify-between items-center px-6 py-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-90 text-cyan-400" : "group-hover:text-slate-300"}`}>▶</span>
                        <span className="font-semibold text-slate-300 text-lg group-hover:text-white transition-colors">{cat}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-500 group-hover:text-slate-300">{toBRL(dCat.total)}</span>
                    </button>

                    {isOpen && (
                      <div className="bg-black/20 px-4 py-4 space-y-3 shadow-inner">
                        {Object.entries(dCat.forns).map(([forn, dForn]: [string, any]) => {
                          const idForn = `${idCat}-${forn}`;
                          const isOpenForn = abertos[idForn] || busca.length > 0;

                          return (
                            <div key={forn} className="bg-slate-800/40 border-l-4 border-cyan-600 rounded-r-xl overflow-hidden">
                              <button onClick={() => toggle(idForn)} className="w-full flex justify-between items-center px-4 py-3 hover:bg-white/5 transition-colors text-left">
                                <div className="flex items-center gap-3">
                                  <span className={`text-[10px] text-slate-500 transition-transform ${isOpenForn ? "rotate-90 text-cyan-400" : ""}`}>▶</span>
                                  <span className="text-sm font-bold text-slate-200">{forn}</span>
                                </div>
                                <span className="text-sm font-bold text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded border border-cyan-500/20">{toBRL(dForn.total)}</span>
                              </button>

                              {isOpenForn && (
                                <div className="border-t border-white/5 animate-in slide-in-from-top-1">
                                  <table className="w-full text-xs text-left text-slate-400">
                                    <thead className="bg-white/5 text-slate-300 font-semibold uppercase">
                                      <tr><th className="p-3 pl-5">Material</th><th className="p-3 text-center">Qtd</th><th className="p-3">Un</th><th className="p-3 text-right">Médio</th><th className="p-3 text-right pr-5">Total</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                      {Object.values(dForn.mats).map((m: any, i: number) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                          <td className="p-3 pl-5 text-slate-300 font-medium truncate max-w-[200px]">{m.desc}</td>
                                          <td className="p-3 text-center font-mono text-slate-400">{m.qtd.toLocaleString("pt-BR")}</td>
                                          <td className="p-3 text-[10px] uppercase text-slate-500">{m.un}</td>
                                          <td className="p-3 text-right">{toBRL(m.val / (m.qtd || 1))}</td>
                                          <td className="p-3 text-right pr-5 font-bold text-emerald-400">{toBRL(m.val)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}