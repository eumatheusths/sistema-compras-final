import { NextResponse } from "next/server";
import { getUsuarios, atualizarUsuario } from "@/lib/google-sheets";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

// Rota para LISTAR usuários (GET)
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session as any).user?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const usuarios = await getUsuarios();
  return NextResponse.json(usuarios);
}

// Rota para ATUALIZAR usuário (PUT)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions); 
  
  if (!session || (session as any).user?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { rowIndex, role, approved, modules } = body;

  if (!rowIndex) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const sucesso = await atualizarUsuario(rowIndex, { role, approved, modules });

  if (sucesso) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Erro ao salvar na planilha" }, { status: 500 });
  }
}