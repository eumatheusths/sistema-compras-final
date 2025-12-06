"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoginPage) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Efeito de fundo futurista no login */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 z-0"></div>
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      
      {/* MENU LATERAL */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/90 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:block
      `}>
        <Sidebar />
      </div>

      {/* BOTÃO MOBILE */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-blue-600/80 backdrop-blur-md text-white p-3 rounded-xl shadow-lg border border-white/10"
      >
        {mobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>

      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" />
      )}
    </div>
  );
}f