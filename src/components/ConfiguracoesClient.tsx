"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface User {
  rowIndex: number;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  modules: string;
}

export default function ConfiguracoesClient() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const availableModules = [
    { id: "dashboard", label: "Dashboard" },
    { id: "produtos", label: "Produtos" },
    { id: "fornecedores", label: "Fornecedores" },
    { id: "relatorios", label: "Relatórios" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/usuarios");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleUpdate = async (rowIndex: number, field: string, value: any) => {
    const updatedUsers = users.map(u => u.rowIndex === rowIndex ? { ...u, [field]: value } : u);
    setUsers(updatedUsers);
    
    const u = updatedUsers.find(u => u.rowIndex === rowIndex);
    if (!u) return;

    await fetch("/api/usuarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowIndex: u.rowIndex, role: u.role, approved: u.approved, modules: u.modules })
    });
  };

  const toggleModule = (rowIndex: number, moduleId: string, currentModules: string) => {
    const arr = currentModules.split(",").filter(m => m);
    let newModules = arr.includes(moduleId) ? arr.filter(m => m !== moduleId).join(",") : [...arr, moduleId].join(",");
    handleUpdate(rowIndex, "modules", newModules);
  };

  if (loading) return <div className="text-white text-center p-10 animate-pulse">Carregando sistema...</div>;

  if (session?.user?.email !== "marketing@nicopel.com.br" && (session?.user as any)?.role !== "admin") {
    return <div className="text-red-400 p-10 text-center font-bold">ACESSO NEGADO 🚫</div>;
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
      
      <div className="bg-slate-900/80 px-8 py-6 border-b border-white/5">
        <h2 className="text-xl font-bold text-white">Controle de Acessos</h2>
        <p className="text-sm text-slate-500">Gerencie quem entra e o que vê.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-slate-400 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-8 py-5">Usuário</th>
              <th className="px-8 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-center">Nível</th>
              <th className="px-8 py-5">Permissões de Módulo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.rowIndex} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white">
                      {user.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-8 py-6 text-center">
                  <button
                    onClick={() => handleUpdate(user.rowIndex, "approved", !user.approved)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg ${
                      user.approved 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30" 
                        : "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                    }`}
                  >
                    {user.approved ? "● ATIVO" : "○ BLOQUEADO"}
                  </button>
                </td>

                <td className="px-8 py-6 text-center">
                  <button
                    onClick={() => handleUpdate(user.rowIndex, "role", user.role === "admin" ? "user" : "admin")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg ${
                      user.role === "admin"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30"
                        : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700"
                    }`}
                  >
                    {user.role === "admin" ? "👑 ADMIN" : "👤 USER"}
                  </button>
                </td>

                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-2">
                    {availableModules.map((mod) => {
                      const isActive = user.modules.includes(mod.id);
                      return (
                        <button
                          key={mod.id}
                          onClick={() => toggleModule(user.rowIndex, mod.id, user.modules)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all ${
                            isActive 
                              ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                              : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {mod.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}