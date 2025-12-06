"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const modules = user?.modules || "";
  const isAdmin = user?.role === "admin" || user?.email === "marketing@nicopel.com.br";

  return (
    <div className="h-screen w-full flex flex-col justify-between text-slate-300 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-10 tracking-tight">
          NICOPEL <span className="text-xs text-slate-500 block font-medium tracking-widest mt-1">SISTEMA 2.0</span>
        </h1>
        
        <nav className="space-y-1">
          {(modules.includes("dashboard") || isAdmin) && (
            <Link href="/" className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <span className="text-xl group-hover:scale-110 transition-transform">📊</span> 
              <span className="font-medium">Dashboard</span>
            </Link>
          )}

          {(modules.includes("relatorios") || isAdmin) && (
            <Link href="/relatorios" className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <span className="text-xl group-hover:scale-110 transition-transform">📑</span> 
              <span className="font-medium">Relatórios</span>
            </Link>
          )}

          {(modules.includes("fornecedores") || isAdmin) && (
            <Link href="/fornecedores" className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <span className="text-xl group-hover:scale-110 transition-transform">🚚</span> 
              <span className="font-medium">Fornecedores</span>
            </Link>
          )}

          {(modules.includes("produtos") || isAdmin) && (
            <Link href="/produtos" className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <span className="text-xl group-hover:scale-110 transition-transform">📦</span> 
              <span className="font-medium">Produtos</span>
            </Link>
          )}

          {isAdmin && (
            <div className="pt-6 mt-6 border-t border-white/10">
              <Link href="/configuracoes" className="group flex items-center gap-3 px-4 py-3 rounded-xl text-purple-300 transition-all duration-200 hover:bg-purple-500/10 hover:text-purple-200 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <span className="text-xl group-hover:rotate-90 transition-transform duration-500">⚙️</span> 
                <span className="font-medium">Configurações</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
      
      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate w-32">{user?.name || "Usuário"}</p>
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">{user?.role === "admin" ? "ADMINISTRADOR" : "COLABORADOR"}</p>
          </div>
        </div>
        
        <button onClick={() => signOut()} className="w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 hover:border-red-500 transition flex items-center justify-center gap-2">
          LOGOUT
        </button>
      </div>
    </div>
  );
}