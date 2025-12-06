"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const pathname = usePathname();

  // Se estiver na página de login, NÃO mostra o menu
  if (pathname === "/login") {
    return null;
  }

  return <Sidebar />;
}