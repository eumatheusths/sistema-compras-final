"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Acesso negado! Verifique e-mail, senha ou se seu usuário foi aprovado.");
      setLoading(false);
    } else {
      router.push("/"); // Redireciona para o Dashboard
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Nicopel</h1>
          <p className="text-slate-500">Sistema de Compras</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              loading 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30"
            }`}
          >
            {loading ? "Entrando..." : "Acessar Sistema"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          &copy; 2025 Nicopel - Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}